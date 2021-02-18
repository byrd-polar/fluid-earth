<script>
  import { fly, fade } from 'svelte/transition';
  import PinIcon from 'carbon-icons-svelte/lib/LocationHeartFilled32';
  import tooltip from '../tooltip.js';
  import { dataPoint } from '../map/gridded.js';
  import { clipped } from '../map/projections/';
  import { convert, prettyUnit, prettyLatLon } from '../utility.js';

  export let pins;
  export let pin;
  export let d3geoProjection;
  export let griddedData;
  export let griddedUnit;

  let label = pin.label;
  let lonLat = [pin.longitude, pin.latitude];
  let hovering = false;

  $: [x, y] = d3geoProjection(lonLat);
  $: clip = clipped(d3geoProjection, lonLat);
  $: value = dataPoint(griddedData, lonLat);
</script>


<div
  class="pin"
  class:clip
  style="left: {x}px; top: {y}px;"
  in:fly="{{ y: -150, duration: 250 }}"
  out:fade="{{ duration: 250 }}"
  on:mouseenter={() => hovering = true}
  on:mouseleave={() => hovering = false}
>
  <PinIcon
    class="marker"
    style="z-index: {-1e8 + Math.round(y * 8)}"
    on:click={() => pins = pins.filter(p => p !== pin)}
  />
  {#if hovering}
    <div class="caption">
      <span class="plain">
        {#if label}
          {label}
        {:else}
          Location {pin.id}
        {/if}
        <br>
      </span>
      <strong class="bold">
        {#if isNaN(value)}
          No data
        {:else}
          {convert(value, griddedData, griddedUnit).toFixed(1)}
          {prettyUnit(griddedUnit)}
        {/if}
      </strong><br>
      <small class="plain">
        {prettyLatLon(pin.latitude, pin.longitude)}
    </div>
  {/if}
</div>


<style>
  div.pin {
    position: absolute;
    pointer-events: auto;
  }

  div.pin.clip {
    display: none;
  }

  div.pin > :global(*) {
    position: absolute;
  }

  div.pin > :global(.marker) {
    top: -30px;
    left: -16px;
    color: red;
    cursor: pointer;
    filter: drop-shadow(0 0 0.25em black);
    display: block;
  }

  .caption {
    width: max-content;
    background-color: beige;
    border-radius: .5rem;
    box-shadow: 0 0 10px #000;
    font-size: .8rem;
    line-height: 1.2;
    padding: .25rem .5rem;
    top: 0.25rem;
    left: 0.25rem;
  }

  .plain {
    color: #6c757d;
  }

  .bold {
    color: #000;
    font-weight: bolder;
  }
</style>
