<script>
  import Pin from '../components/Pin.svelte';
  import { convert, prettyUnit } from '../utility.js';

  export let forwardProjectionFunction;
  export let pins;
  export let cursor;
  export let griddedData;
  export let griddedUnit;

  let lonLat, point, value, x, y, span;

  $: if (cursor && span) {
    lonLat = [cursor.longitude, cursor.latitude];
    point = forwardProjectionFunction(lonLat);
    value = griddedData.get(lonLat);
    x = point ? point[0] - span.clientWidth / 2 : -100;
    y = point ? point[1] - span.clientHeight * 1.25 : -100;
  }
</script>

<div>
  {#each pins as pin (pin)}
    <Pin
      bind:pins
      {pin}
      {forwardProjectionFunction}
      {griddedData}
      {griddedUnit}
    />
  {/each}
  {#if cursor}
    <span bind:this={span} style="left: {x}px; top: {y}px;">
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
    color: white;
    background: #202124;
    padding: 0 0.25em;
    border-radius: 0.25em;
    font-size: 0.9em;
  }
</style>
