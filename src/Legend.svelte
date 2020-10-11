<script>
  import * as d3 from 'd3-selection';
  import { axisBottom } from 'd3-axis';
  import { scaleLinear } from 'd3-scale';
  import { onMount } from 'svelte';

  export let griddedColormap;
  export let griddedDomain = [0, 0];

  let svgScale;
  let svgScaleWidth;
  function createAxis() {
    let axis = axisBottom(
      scaleLinear()
        .domain(griddedDomain)
        .range([-0.5, svgScaleWidth - 0.5])
    );
    d3.select(svgScale).call(axis);
  }
  onMount(createAxis);
  $: svgScaleWidth, griddedDomain, createAxis();

  let cssLut;
  $: cssLut = griddedColormap.lut.map(colorArray => {
    return `rgb(${colorArray.map(c => Math.round(255 * c)).join()})`;
  }).join();
</script>

<div class="legend-wrapper">
  <p>Hello there, I'm a color legend! (without units yet...)</p>
  <div
    class="legend"
    style="background: linear-gradient(to right, {cssLut});"
    bind:clientWidth={svgScaleWidth}
  ></div>
  <svg bind:this={svgScale}></svg>
</div>

<style>
  div.legend-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    user-select: none;
  }

  div.legend-wrapper > * {
    max-width: 90%;
    width: 30rem;
    z-index: 1;
  }

  p {
    color: white;
    margin-bottom: 0.25em;
  }

  div.legend {
    height: 2em;
  }

  svg {
    font-size: 0.875em;
    overflow: visible;
    color: white;
    height: 3em;
    margin-bottom: 2rem;
  }
</style>
