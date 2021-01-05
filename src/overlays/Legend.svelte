<script>
  import * as d3 from 'd3-selection';
  import { axisBottom } from 'd3-axis';
  import { scaleLinear } from 'd3-scale';
  import { onMount } from 'svelte';

  export let date;
  export let griddedDatasetInfo;
  export let particleDatasetInfo;
  export let griddedColormap;
  export let griddedDomain;
  export let particlesShown;
  export let particleDisplay;

  // see options parameter here: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat
  let dateStringOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short',
  };

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
  <span class="datetime">
    {date.toLocaleDateString(undefined, dateStringOptions)}
  </span>
  {#if particlesShown}
    <span class="streamlines">
      Streamlines representing {particleDatasetInfo.description}, moving
      {particleDisplay.rate.toLocaleString()} times faster than actual
    </span>
  {/if}
  <span class="gridded">
    {griddedDatasetInfo.description}
    {#if griddedDatasetInfo.units}({griddedDatasetInfo.units}){/if}
  </span>
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
    justify-content: flex-start;
    align-items: center;
    user-select: none;
    pointer-events: none;
  }

  div.legend-wrapper > * {
    max-width: 90%;
    width: 36rem;
    pointer-events: auto;
  }

  span, svg {
    font-size: 1rem;
    color: white;
    /* multiple comma-separated shadows used to increase intensity */
    text-shadow:
      0 0 0.25em black,
      0 0 0.5em black,
      0 0 1em black;
  }

  span {
    font-weight: bold;
    font-size: 0.875em;
  }

  span.datetime {
    text-align: center;
    margin-top: 3.9vh;
  }

  span.streamlines {
    font-weight: normal;
    font-size: 0.75em;
    text-align: center;
  }

  span.gridded {
    margin-top: auto;
    padding-bottom: 0.125em;
  }

  span.gridded::first-letter {
    text-transform: uppercase;
  }

  div.legend {
    height: 3.5vh;
  }

  svg {
    font-size: 0.75rem;
    overflow: visible;
    height: 1.25rem;
    margin-bottom: 3.9vh;
  }

  @media (max-width: 36rem) {
    span.datetime {
      /* height of nav rail (top plus bottom padding plus mdc-icon-button
       * height) plus the margin-bottom in the svg rule */
      margin-top: calc(1em + 48px + 0.25rem);
    }

    div.legend {
      height: 5vh;
    }

    svg {
      margin-bottom: 0.25rem;
    }
  }
</style>
