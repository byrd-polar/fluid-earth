<script>
  import { fly } from 'svelte/transition';
  import LocationStarFilled24 from "carbon-icons-svelte/lib/LocationStarFilled24";
  import tooltip from '../tooltip.js';
  import { dataPoint } from '../map/gridded.js';
  import { clipped } from '../map/projections/';
  import Hoverable from './Hoverable.svelte';

  export let pins;
  export let pin;
  export let d3geoProjection;
  export let griddedData;
  export let griddedDataset;

  let label = pin.label;
  let lonLat = [pin.longitude, pin.latitude];
  $: [x, y] = d3geoProjection(lonLat);
  $: clip = clipped(d3geoProjection, lonLat);
  $: value = dataPoint(griddedData, lonLat);
  $: lonDirection = pin.longitude >= 0 ? "E" : "W";
  $: latDirection = pin.latitude >= 0 ? "N" : "S";
</script>


<Hoverable let:hovering={hovering}>
  <div
    class="pin"
    style="left: {x - 12.5}px; top: {y - 21}px"
    class:clip
    in:fly="{{ y: -150, duration: 250 }}"
    on:click={() => { pins.delete(pin); pins = pins}}
  >
    <LocationStarFilled24 class="marker"/>
  </div>
  {#if hovering}
    <div
      style="left:{x-10}px;top:{y+5}px;"
      class="caption"
    >
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
</Hoverable>


<style>
  div.pin {
    pointer-events: auto;
    position: absolute;
  }

  div.pin :global(.marker) {
    color: red;
    cursor: pointer;
    filter: drop-shadow(0 0 0.25em black);
  }

  div.pin.clip {
    display: none;
  }

  .caption {
    position: absolute;
    background-color: beige;
    border-radius: .5rem;
    box-shadow: 0 0 10px #000;
    font-size: .8rem;
    line-height: 1.2;
    padding: .25rem .5rem;
    transform: translate(1.2rem);
    z-index: 2;
  }

  .plain {
    font-family: Quicksand-regular;
    color: #6c757d;
  }

  .bold {
    font-family: Quicksand-bold;
    color: #000;
    font-weight: bolder;
  }
</style>
