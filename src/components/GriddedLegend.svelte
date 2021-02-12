<script>
  import * as d3 from 'd3-selection';
  import { axisBottom } from 'd3-axis';
  import { scaleLinear } from 'd3-scale';
  import { convert, prettyUnit } from '../utility.js';

  export let griddedDataset;
  export let griddedColormap;
  export let griddedDomain;
  export let griddedUnit;

  let svgScale;
  let svgScaleWidth;

  // updates when changing domain independently of dataset (or after dataset
  // download completes
  $: createAxis(svgScale, svgScaleWidth, griddedDomain);
  // updates immediately after selecting dataset instead of after download
  $: createAxis(svgScale, svgScaleWidth, griddedDataset.domain);

  function createAxis(elem, width, domain) {
    if (!elem) return;

    let axis = axisBottom(
      scaleLinear()
        .domain(domain.map(v => convert(v, griddedDataset, griddedUnit)))
        .range([-0.5, width - 0.5])
    );
    d3.select(elem).call(axis);
  }

  // updates when changing colormap independently of dataset (or after dataset
  // download completes)
  $: cssLut = generateLut(griddedColormap);
  // updates immediately after selecting dataset instead of after download
  $: cssLut = generateLut(griddedDataset.colormap);

  function generateLut(colormap) {
    return colormap.lut.map(colorArray => {
      return `rgb(${colorArray.map(c => Math.round(255 * c)).join()})`;
    }).join();
  }
</script>

<section>
  <h3>
    {griddedDataset.description}
    {#if griddedUnit}({prettyUnit(griddedUnit)}){/if}
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
    pointer-events: auto;

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
