<script>
  import * as d3 from 'd3-selection';
  import { axisBottom } from 'd3-axis';
  import { scaleLinear, scaleLog } from 'd3-scale';
  import Qty from 'js-quantities/esm';
  import {
    convert,
    prettyUnit,
    capitalizeFirstLetter,
    simpleTranslate,
  } from '../utility.js';
  import tooltip from '../tooltip.js';

  export let griddedName;
  export let griddedColormap;
  export let griddedDomain;
  export let griddedScale;
  export let griddedOriginalUnit;
  export let griddedUnit;
  export let preferredUnits;
  export let simplifiedMode;

  let svgScale;
  let svgScaleWidth;

  $: createAxis(svgScale, svgScaleWidth, griddedDomain, griddedUnit);
  $: cssLut = generateLut(griddedColormap);

  function createAxis(elem, width, domain, griddedUnit) {
    if (!elem) return;

    let scale = griddedScale === 'log' ? scaleLog : scaleLinear;
    let axis = axisBottom(
      scale()
        .domain(domain.map(v => convert(v, griddedOriginalUnit, griddedUnit)))
        .range([-0.5, width - 0.5])
    );
    d3.select(elem).call(axis);
  }

  function generateLut(colormap) {
    return colormap.lut.map(colorArray => `rgb(${colorArray.join()})`).join();
  }

  $: qty = Qty.parse(griddedOriginalUnit);
  $: unitList = qty ? preferredUnits[qty.kind()] : null;

  function toggleUnit() {
    if (!unitList) return;

    unitList.push(unitList.shift()); // rotate list
    preferredUnits = preferredUnits;
  }

  // simulate html button functionality
  function handleKeydown(e) {
    if (!(e.code === 'Space' || e.code === 'Enter')) return;

    toggleUnit();
  }

  function formatTitle(name, griddedUnit, simplifiedMode) {
    if (simplifiedMode) name = simpleTranslate(name);
    return capitalizeFirstLetter(`${name} (${prettyUnit(griddedUnit)})`)
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
  <h3>{formatTitle(griddedName, griddedUnit, simplifiedMode)}</h3>
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
