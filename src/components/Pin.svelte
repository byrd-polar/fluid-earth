<script>
  import { fly } from 'svelte/transition';
  import PinIcon from 'carbon-icons-svelte/lib/LocationHeartFilled32';
  import tooltip from '../tooltip.js';
  import { dataPoint } from '../map/gridded.js';
  import { clipped } from '../map/projections/';

  export let pins;
  export let pin;
  export let d3geoProjection;
  export let griddedData;
  export let griddedDataset;

  let label = pin.label;
  let lonLat = [pin.longitude, pin.latitude];
  let hovering = false;

  $: [x, y] = d3geoProjection(lonLat);
  $: clip = clipped(d3geoProjection, lonLat);
  $: value = dataPoint(griddedData, lonLat);
  $: lonDirection = pin.longitude >= 0 ? "E" : "W";
  $: latDirection = pin.latitude >= 0 ? "N" : "S";
</script>


<div
  class="pin"
  class:clip
  style="left: {x}px; top: {y}px;"
  in:fly="{{ y: -150, duration: 250 }}"
  on:click={() => { pins.delete(pin); pins = pins}}
  on:mouseenter={() => hovering = true}
  on:mouseleave={() => hovering = false}
>
  <PinIcon class="marker" style="z-index: {-1e8 + Math.round(y * 8)}"/>
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
        {value.toPrecision(3)}
      </strong>
      <strong class="bold">
        {griddedDataset.units}
      </strong><br>
      <small class="plain">
        {Math.abs(pin.longitude).toFixed(2)}° {lonDirection}, {Math.abs(pin.latitude).toFixed(2)}° {latDirection}
      </small><br>
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
