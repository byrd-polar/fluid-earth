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

  // first $: statement in each group updates immediately after selecting
  // dataset instead of after download

  // second $: statment in each group updates when changing values independently
  // of dataset (or after dataset download completes)

  $: createAxis(
    svgScale, svgScaleWidth, griddedDataset.domain, griddedDataset.unit);
  $: createAxis(svgScale, svgScaleWidth, griddedDomain, griddedUnit);

  $: cssLut = generateLut(griddedDataset.colormap);
  $: cssLut = generateLut(griddedColormap);

  $: unit = prettyUnit(griddedDataset.unit);
  $: unit = prettyUnit(griddedUnit);

  function createAxis(elem, width, domain, unit) {
    if (!elem) return;

    let axis = axisBottom(
      scaleLinear()
        .domain(domain.map(v => convert(v, griddedDataset, unit)))
        .range([-0.5, width - 0.5])
    );
    d3.select(elem).call(axis);
  }

  function generateLut(colormap) {
    return colormap.lut.map(colorArray => {
      return `rgb(${colorArray.map(c => Math.round(255 * c)).join()})`;
    }).join();
  }
</script>

<section>
  <h3>
    {griddedDataset.name} ({@html unit})
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
