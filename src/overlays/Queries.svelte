<script>
  import Pin from '../components/Pin.svelte';
  import { convert, prettyUnit } from '../utility.js';
  import { scaleSequential, scaleSequentialLog } from 'd3-scale';
  import { interpolateRgbBasis } from 'd3-interpolate';
  import { color } from 'd3-color';
  import { hex } from 'wcag-contrast';

  export let forwardProjectionFunction;
  export let pins;
  export let cursor;
  export let griddedData;
  export let griddedUnit;
  export let griddedDomain;
  export let griddedScale;
  export let griddedColormap;

  export let kioskMode;

  let lonLat, point, value, x, y, bgColor, textColor, span;

  $: scaleFn = griddedScale === 'log' ? scaleSequentialLog : scaleSequential;
  $: valueToColor = scaleFn(
    griddedDomain,
    interpolateRgbBasis(griddedColormap.lut.map(c => {
      return `rgb(${c.map(v => Math.round(v)).join(',')})`;
    }))
  );

  $: if (cursor && span) {
    lonLat = [cursor.longitude, cursor.latitude];
    point = forwardProjectionFunction(lonLat);
    value = griddedData.get(lonLat);
    x = point ? point[0] - span.clientWidth / 2 : -100;
    y = point ? point[1] - span.clientHeight * 1.25 : -100;
    bgColor = isNaN(value) ? '#333' :valueToColor(value);
    let bgHex = color(bgColor).formatHex();
    textColor = ['#000', '#fff'].reduce((a, b) => {
      return hex(a, bgHex) > hex(b, bgHex) ? a : b;
    });
  }
</script>

<div>
  {#if !kioskMode}
    {#each pins as pin (pin)}
      <Pin
        bind:pins
        {pin}
        {forwardProjectionFunction}
        {griddedData}
        {griddedUnit}
      />
    {/each}
  {/if}
  {#if cursor}
    <span
      bind:this={span}
      style="
        left: {x}px; top: {y}px;
        background: {bgColor};
        color: {textColor};
      "
    >
      {#if isNaN(value)}
        No data
      {:else}
        {convert(value, griddedData.originalUnit, griddedUnit).toFixed(1)}
        {prettyUnit(griddedUnit)}
      {/if}
    </span>
  {/if}
</div>

<style>
  div {
    pointer-events: none;
    overflow: hidden;
    z-index: 0; /* create separate stacking context for pins */
  }

  span {
    position: absolute;
    padding: 0 0.25em;
    border-radius: 0.5em;
    font-size: 0.9em;
    white-space: nowrap;
    box-shadow: 0 0 0.25em black;
  }
</style>
