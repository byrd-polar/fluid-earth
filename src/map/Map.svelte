<script>
  import { onMount } from 'svelte';
  import * as twgl from 'twgl.js';

  let mapCanvas;
  let gl;

  // Begin map rendering after Svelte component has been mounted
  onMount(() => {
    gl = mapCanvas.getContext('webgl');
    requestAnimationFrame(render);
  });

  // Main animation loop
  function render() {
    if (twgl.resizeCanvasToDisplaySize(gl.canvas)) {
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      console.log(gl);
    };

    requestAnimationFrame(render);
  }
</script>

<canvas bind:this={mapCanvas}/>

<style>
  canvas {
    height: 100%;
    width: 100%;
    background-color: blue;
  }
</style>
