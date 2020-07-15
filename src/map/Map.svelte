<script>
  import { onMount } from 'svelte';
  import * as twgl from 'twgl.js';

  import bgVertexShader from './background.vert';
  import bgFragmentShader from './background.frag';

  let mapCanvas;

  let gl;
  let bgProgramInfo;
  let bgBufferInfo;
  let bgTexture;
  let canvasRatio;

  // Attributes passed to the background vertex shader
  const arrays = {
    a_position: {
      // Indicate we are using 2-dimensional points
      numComponents: 2,
      // Two triangles to form a rectangle from bottom-left corner (-1, -1) to
      // top-right cornder (1, 1) in clip space coordiantes
      data: [
        -1, -1,
         1, -1,
        -1,  1,

        -1,  1,
         1, -1,
         1,  1,
      ],
    },
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

    bgBufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

    // loads actual texture asynchronously; will be rendered when available
    // this should be a plate carée map projection with aspect ratio 2:1
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
    };

    gl.useProgram(bgProgramInfo.program);
    twgl.setBuffersAndAttributes(gl, bgProgramInfo, bgBufferInfo);
    twgl.setUniforms(bgProgramInfo, bgUniforms);
    twgl.drawBufferInfo(gl, bgBufferInfo);
  }
</script>

<canvas bind:this={mapCanvas}/>

<style>
  canvas {
    height: 100%;
    width: 100%;
  }
</style>
