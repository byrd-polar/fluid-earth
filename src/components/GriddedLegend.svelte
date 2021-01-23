<script>
  import * as d3 from 'd3-selection';
  import { axisBottom } from 'd3-axis';
  import { scaleLinear } from 'd3-scale';
  import { onMount } from 'svelte';

  export let griddedDataset;
  export let griddedColormap;
  export let griddedDomain;

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

<section>
  <h3>
    {griddedDataset.description}
    {#if griddedDataset.units}({griddedDataset.units}){/if}
  </h3>
  <div
    style="background: linear-gradient(to right, {cssLut});"
    bind:clientWidth={svgScaleWidth}
  ></div>
  <svg bind:this={svgScale}></svg>
</section>

<style>
  section {
    flex: 1;
    padding: 0 0.75rem 0.25rem;
    max-width: 32em;
    flex-basis: 24em;

    margin-left: auto;
  }

  h3 {
    margin: 0;
    font-size: 1em;
  }

  h3::first-letter {
    text-transform: uppercase;
  }

  div {
    height: 0.8em;
  }

  svg {
    font-size: 0.75rem;
    height: 1.25rem;

    overflow: visible;
    width: 100%;
  }
</style>
