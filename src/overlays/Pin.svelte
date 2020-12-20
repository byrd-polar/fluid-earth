<script>
  import { clipped } from '../map/projections/';
  export let pins;
  export let pin;
  export let d3geoProjection;

  let lonLat = [pin.longitude, pin.latitude];
  $: [x, y] = d3geoProjection(lonLat);
  $: clip = clipped(d3geoProjection, lonLat);
</script>

{#if !clip}
  <div
    style="top: {y - 5}px; left: {x - 5}px"
    on:click={() => { pins.delete(pin); pins = pins}}
  >
  </div>
{/if}

<style>
  div {
    pointer-events: auto;
    height: 10px;
    width: 10px;
    position: absolute;
    background-color: red;
  }
</style>
