<script>
  import * as d3 from 'd3-selection';
  import { axisBottom } from 'd3-axis';
  import { scaleLinear } from 'd3-scale';
  import { onMount } from 'svelte';

  export let griddedData = { description: 'Loading...' };
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
  <h2 class="datetime">Monday, October 12th, 2020 — 2:00pm EDT</h2>
  <h2 class="title">
    {griddedData.description}
    {#if griddedData.units}({griddedData.units}){/if}
  </h2>
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
    width: 36rem;
    z-index: 1;
  }

  h2, svg {
    font-size: 1rem;
    color: white;
    /* multiple comma-separated shadows used to increase intensity */
    text-shadow:
      0 0 0.25em black,
      0 0 0.5em black,
      0 0 1em black;
  }

  h2.datetime {
    text-align: center;
    margin: 3.9vh 0 auto;
  }

  h2.title {
    margin: 0;
    padding-bottom: 0.125em;
  }

  div.legend {
    height: 3.5vh;
  }

  svg {
    font-size: 0.875rem;
    overflow: visible;
    height: 1.25rem;
    margin-bottom: 3.9vh;
  }

  @media (max-width: 36rem) {
    h2.datetime {
      /* height of nav rail (top plus bottom padding plus mdc-icon-button
       * height) plus the margin-bottom in the svg rule */
      margin: calc(1em + 48px + 0.5rem) 0 auto;
    }

    div.legend {
      height: 5vh;
    }

    svg {
      margin-bottom: 0.5rem;
    }
  }
</style>
