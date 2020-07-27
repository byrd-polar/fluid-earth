<script>
  import { onMount } from 'svelte';
  import * as twgl from 'twgl.js';

  import griddedVertexShader from './gridded.vert';
  import griddedFragmentShader from './gridded.frag';

  export let latitude = 0; // in degrees
  export let longitude = 0; // in degrees
  export let zoom = 1;

  let bgNeedsRedraw = true;
  // Whenever any of these variables change, ask for a redraw on next frame
  $: latitude, longitude, zoom, bgNeedsRedraw = true;

  // Limit ranges of latitude, longitude, and zoom
  $: latitude = Math.min(latitude, 90);
  $: latitude = Math.max(latitude, -90);
  $: longitude = ((longitude + 180) % 360) - 180;
  $: zoom = Math.min(zoom, 15);
  $: zoom = Math.max(zoom, 0.5);

  let mapCanvas;
  let canvasRatio;

  let gl;

  let griddedProgramInfo;
  let griddedBufferInfo;
  let griddedTexture;

  // Attributes passed to the gridded data layer vertex shader
  const griddedArrays = {
    // A grid of points
    a_position: {
      numComponents: 2, // Indicate we are using 2-dimensional points
      data: [ // two right triangles that cover entire screen
        -1, -1,
        -1,  1,
         1, -1,
         1,  1,
         1, -1,
        -1,  1,
      ],
    },
  };

  // Begin map rendering after Svelte component has been mounted
  onMount(() => {
    gl = mapCanvas.getContext('webgl');
    if (!gl) {
      return;
    }

    griddedProgramInfo = twgl.createProgramInfo(gl, [
      griddedVertexShader,
      griddedFragmentShader,
    ]);
    griddedBufferInfo = twgl.createBufferInfoFromArrays(gl, griddedArrays);

    // loads actual texture asynchronously; will be rendered when available,
    // should be a plate carée map projection with aspect ratio 2:1
    griddedTexture = twgl.createTexture(gl, {
      src: '/8k_earth_daymap.jpg',
      min: gl.LINEAR,
    }, () => bgNeedsRedraw = true);

    // ensure correct the initial size of canvas and viewport
    gl.canvas.width = 0;
    gl.canvas.height = 0;
    updateSizeVariables(gl);

    requestAnimationFrame(render);
  });

  function updateSizeVariables(gl) {
    const ratio = window.devicePixelRatio;
    if (twgl.resizeCanvasToDisplaySize(gl.canvas, ratio)) {
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      canvasRatio = gl.canvas.clientWidth / gl.canvas.clientHeight;
      bgNeedsRedraw = true;
    }
  }

  // Main animation loop
  function render(time) {
    updateSizeVariables(gl);

    if (bgNeedsRedraw) {
      drawMapBackground();
      bgNeedsRedraw = false;
    }

    requestAnimationFrame(render);
  }

  function drawMapBackground() {
    const griddedUniforms = {
      u_texture: griddedTexture,
      u_canvasRatio: canvasRatio,
      u_lon0: longitude,
      u_lat0: latitude,
      u_zoom: zoom,
    };

    gl.useProgram(griddedProgramInfo.program);
    twgl.setBuffersAndAttributes(gl, griddedProgramInfo, griddedBufferInfo);
    twgl.setUniforms(griddedProgramInfo, griddedUniforms);
    twgl.drawBufferInfo(gl, griddedBufferInfo);
  }
</script>

<canvas bind:this={mapCanvas}/>

<style>
  canvas {
    height: 100%;
    width: 100%;
    background-color: black;
  }
</style>
