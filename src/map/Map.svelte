<script>
  import { onMount } from 'svelte';

  let canvas;

  onMount(() => {
    let gl = canvas.getContext('webgl');
    canvas.style.backgroundColor = 'red';
    console.log(gl);
  })
</script>

<canvas bind:this={canvas}/>

<style>
  canvas {
    height: 100%;
    width: 100%;
    background-color: blue;
  }
</style>
