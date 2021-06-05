<script>
  import * as d3 from 'd3-selection';
  import { axisBottom } from 'd3-axis';
  import { scaleLinear } from 'd3-scale';
  import Qty from 'js-quantities/esm';
  import {
    convert,
    prettyUnit,
    capitalizeFirstLetter,
    simpleTranslate,
  } from '../utility.js';
  import tooltip from '../tooltip.js';

  export let griddedDataset;
  export let griddedColormap;
  export let griddedDomain;
  export let griddedUnit;
  export let preferredUnits;
  export let simplifiedMode;

  let svgScale;
  let svgScaleWidth;

  // first $: statement in each group updates immediately after selecting
  // dataset instead of after download

  // second $: statment in each group updates when changing values independently
  // of dataset (or after dataset download completes)

  $: createAxis(
    svgScale, svgScaleWidth, griddedDataset.domain, griddedDataset.unit);
  $: createAxis2(svgScale, griddedDomain, griddedUnit);

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

  // version of createAxis that doesn't get reactively called when svgScaleWidth
  // changes, prevents potential griddedDataset and unit mismatch in convert
  function createAxis2(elem, domain, unit) {
    createAxis(elem, svgScaleWidth, domain, unit);
  }

  function generateLut(colormap) {
    return colormap.lut.map(colorArray => {
      return `rgb(${colorArray.map(c => Math.round(255 * c)).join()})`;
    }).join();
  }

  $: qty = Qty.parse(griddedDataset.unit);
  $: unitList = qty ? preferredUnits[qty.kind()] : null;

  function toggleUnit() {
    if (!unitList) return;

    unitList.push(unitList.shift()); // rotate list
    griddedUnit = unitList[0];
  }

  // simulate html button functionality
  function handleKeydown(e) {
    if (!(e.code === 'Space' || e.code === 'Enter')) return;

    toggleUnit();
  }

  function formatTitle(griddedDataset, unit, simplifiedMode) {
    let name = griddedDataset.name;
    if (simplifiedMode) name = simpleTranslate(name);
    return capitalizeFirstLetter(`${name} (${unit})`)
  }
</script>

<section
  on:click={toggleUnit}
  on:keydown={handleKeydown}
  tabindex="0"
  class:canchange={unitList}
  use:tooltip={{
    content: unitList ? 'Change units' : 'No alternate units available',
    placement: 'top',
  }}
>
  <h3>{formatTitle(griddedDataset, unit, simplifiedMode)}</h3>
  <div
    style="background: linear-gradient(to right, {cssLut});"
    bind:clientWidth={svgScaleWidth}
  ></div>
  <svg bind:this={svgScale}></svg>
</section>

<style>
  section {
    display: flex;
    flex-direction: column;

    flex: 1;
    padding: 0.25rem 0.75rem;
    max-width: 32em;
    flex-basis: 24em;
    pointer-events: auto;
    border-radius: 4px;
    -webkit-tap-highlight-color: transparent;
    transition: background-color 0.25s ease 0s;

    margin-right: auto;
    margin-top: auto;
  }

  section.canchange {
    cursor: pointer;
  }

  section:focus, section:hover {
    background-color: var(--input-color);
    outline: none;
  }

  section:focus:not(:focus-visible):not(:hover) {
    background-color: inherit;
  }

  h3 {
    margin: 0;
    font-size: 1em;
  }

  div {
    height: 0.8em;
  }

  svg {
    font-size: 0.75rem;
    height: 1.5rem;

    overflow: visible;
    width: 100%;
    margin-bottom: 0;
    padding: 0;
  }
</style>
