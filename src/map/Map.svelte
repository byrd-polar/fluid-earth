<script>
  import { onMount } from 'svelte';
  import * as twgl from 'twgl.js';

  let canvas;

  onMount(() => {
    let gl = canvas.getContext('webgl');
    canvas.style.backgroundColor = 'red';
    console.log(gl);
    console.log(twgl);
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
