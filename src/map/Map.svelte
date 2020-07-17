<script>
  import { onMount } from 'svelte';
  import * as twgl from 'twgl.js';

  import bgVertexShader from './background.vert';
  import bgFragmentShader from './background.frag';

  import { clipSpacePointsGrid, triangleStripIndices } from './triangleGrid.js';

  export let latitude = 0;
  export let longitude = 0;
  export let zoom = 1;

  let mapCanvas;

  let gl;
  let bgProgramInfo;
  let bgBufferInfo;
  let bgTexture;
  let canvasRatio;

  let gridDetail = 2048;

  // Attributes passed to the background vertex shader
  const arrays = {
    // A grid of points
    a_position: {
      numComponents: 2, // Indicate we are using 2-dimensional points
      data: clipSpacePointsGrid(gridDetail, gridDetail),
    },
    // Indices for a gl.TRIANGLE_STRIP spanning the above grid
    indices: new Uint32Array(triangleStripIndices(gridDetail, gridDetail)),
  };

  // Begin map rendering after Svelte component has been mounted
  onMount(() => {
    gl = mapCanvas.getContext('webgl');
    if (!gl) {
      return;
    }

    bgProgramInfo = twgl.createProgramInfo(gl, [
      bgVertexShader,
      bgFragmentShader,
    ]);

    // Checks if larger gridDetails value (via buffer index size) is supported
    // by browser, otherwise resets gridDetail to smaller value before
    // creating buffer
    const ext = gl.getExtension('OES_element_index_uint');
    if (!ext) {
      gridDetail = 255;
      arrays.a_position.data = clipSpacePointsGrid(gridDetail, gridDetail);
      arrays.indices = triangleStripIndices(gridDetail, gridDetail);
    }
    bgBufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

    // loads actual texture asynchronously; will be rendered when available,
    // should be a plate carée map projection with aspect ratio 2:1
    bgTexture = twgl.createTexture(gl, {
      src: '/8k_earth_daymap.jpg',
    }, () => drawMapBackground());

    // correct the initial size of canvas and viewport
    twgl.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    canvasRatio = gl.canvas.clientWidth / gl.canvas.clientHeight;

    requestAnimationFrame(render);
  });

  // Main animation loop
  function render(time) {
    if (twgl.resizeCanvasToDisplaySize(gl.canvas)) {
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      canvasRatio = gl.canvas.clientWidth / gl.canvas.clientHeight;
      drawMapBackground();
    };

    requestAnimationFrame(render);
  }

  function drawMapBackground() {
    const bgUniforms = {
      u_texture: bgTexture,
      u_canvasRatio: canvasRatio,
      u_lon0: longitude,
      u_lat0: latitude,
      u_zoom: zoom,
    };

    gl.useProgram(bgProgramInfo.program);
    twgl.setBuffersAndAttributes(gl, bgProgramInfo, bgBufferInfo);
    twgl.setUniforms(bgProgramInfo, bgUniforms);
    twgl.drawBufferInfo(gl, bgBufferInfo, gl.TRIANGLE_STRIP);
  }
</script>

<canvas bind:this={mapCanvas}/>

<style>
  canvas {
    height: 100%;
    width: 100%;
  }
</style>
