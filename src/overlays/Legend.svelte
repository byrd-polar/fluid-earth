<script>
  import * as d3 from 'd3-selection';
  import { axisBottom } from 'd3-axis';
  import { scaleLinear } from 'd3-scale';
  import { onMount } from 'svelte';

  export let date;
  export let griddedDataset;
  export let particleDataset;
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

<div class="wrapper">
  <span>
    {date.toLocaleDateString(undefined, dateStringOptions)}
  </span>
  <div>
    {#if particlesShown}
    <div class="streamlines">
      <span class="label">
        {particleDataset.description}
      </span>
      <div></div>
      <span>
        {particleDisplay.rate.toLocaleString()} times faster than actual
      </span>
    </div>
    {/if}
    <div class="gridded">
      <span class="label">
        {griddedDataset.description}
        {#if griddedDataset.units}({griddedDataset.units}){/if}
      </span>
      <div
        style="background: linear-gradient(to right, {cssLut});"
        bind:clientWidth={svgScaleWidth}
      ></div>
      <svg bind:this={svgScale}></svg>
    </div>
  </div>
</div>

<style>
  span, svg {
    /* multiple comma-separated shadows used to increase intensity */
    text-shadow:
      0 0 0.25em black,
      0 0 0.5em black,
      0 0 1em black;
    display: block; /* needed for ::first-letter capitalization */
  }

  div.wrapper {
    display: flex;
    flex-direction: column;
    color: white;
    pointer-events: none;
  }

  div.wrapper > * {
    pointer-events: auto;
    user-select: none;
  }

  div.wrapper > span {
    text-align: right;
    font-size: 1.2em;
    padding: 0.25rem 0.75rem;
  }

  div.wrapper > div {
    margin-top: auto;
    display: flex;
    flex-wrap: wrap;
  }

  div.wrapper > div > div {
    flex: 1;
    padding: 0 0.75rem 0.25rem;
    max-width: 32em;
    flex-basis: 24em;
  }

  div.streamlines {
    margin-right: auto;
  }

  div.streamlines > div {
    background-color: blue;
  }

  div.gridded {
    margin-left: auto;
  }

  div.streamlines > div,
  div.gridded > div {
    height: 0.8em;
  }

  span.label::first-letter {
    text-transform: uppercase;
  }

  div.streamlines > span:last-child {
    display: block;
    text-align: center;
    border-top: 1px solid white;
  }

  div.streamlines > span:last-child,
  div.gridded > svg {
    font-size: 0.75rem;
    height: 1.25rem;
  }

  div.gridded > svg {
    overflow: visible;
    width: 100%;
  }

  @media (max-width: 36rem) {
    span {
      font-size: 0.875em;
    }

    div.wrapper > span {
      /* height of nav rail (top plus bottom padding plus icon height) */
      margin-top: calc(48px + 1rem);
      font-size: 1em;
      text-align: center;
    }
  }
</style>
