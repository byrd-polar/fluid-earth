<script>
  import * as d3 from 'd3-selection';
  import { axisBottom } from 'd3-axis';
  import { scaleLinear, scaleLog } from 'd3-scale';
  import {
    convert, prettyUnit,
    hasDial, getUnitFromDial, rotateDial,
  } from '../units.js';
  import { capitalizeFirstLetter, handleLikeButton } from '../utility.js';
  import tooltip from '../tooltip.js';

  export let griddedName;
  export let griddedColormap;
  export let griddedDomain;
  export let griddedScale;
  export let griddedOriginalUnit;
  export let griddedUnit;

  let svgScaleElement;
  let svgScaleWidth;

  $: if (svgScaleElement) {
    let scaleFn = griddedScale === 'log' ? scaleLog : scaleLinear;
    let conversion = v => convert(v, griddedOriginalUnit, griddedUnit);
    let axis = axisBottom(
      scaleFn()
        .domain(griddedDomain.map(conversion))
        .range([-0.5, svgScaleWidth - 0.5])
    );
    d3.select(svgScaleElement).call(axis);
  }

  $: cssLut = griddedColormap.lut.map(arr => `rgb(${arr.join()})`).join();

  $: canchange = hasDial(griddedUnit);

  function toggleUnit() {
    rotateDial(griddedUnit);
    griddedUnit = getUnitFromDial(griddedUnit);
  }
</script>

<section
  on:click={toggleUnit}
  on:keydown={handleLikeButton(toggleUnit)}
  role="button"
  tabindex="0"
  class:canchange
  use:tooltip={{
    content: canchange ? 'Change units' : 'No alternate units available',
    placement: 'top',
  }}
>
  <h3>
    {`${capitalizeFirstLetter(griddedName)} (${prettyUnit(griddedUnit)})`}
  </h3>
  <div
    style="background: linear-gradient(to right, {cssLut});"
    bind:clientWidth={svgScaleWidth}
  ></div>
  <svg bind:this={svgScaleElement}></svg>
</section>

<style>
  section {
    display: flex;
    flex-direction: column;

    flex: 1;
    padding: 4px 12px;
    max-width: 512px;
    flex-basis: 384px;
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
    height: 13px;
  }

  svg {
    font-size: 0.75rem;
    height: 1.5rem;

    overflow: visible;
    width: 100%;
    margin-bottom: 0;
    padding: 0;
  }

  svg :global(text) {
    transform: translate(0, 15%);
  }
</style>
