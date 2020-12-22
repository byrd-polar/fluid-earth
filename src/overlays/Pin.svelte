<script>
  import tooltip from '../tooltip.js';
  import { dataPoint } from '../map/gridded.js';
  import { clipped } from '../map/projections/';
  export let pins;
  export let pin;
  export let d3geoProjection;
  export let griddedData;

  let lonLat = [pin.longitude, pin.latitude];
  $: [x, y] = d3geoProjection(lonLat);
  $: clip = clipped(d3geoProjection, lonLat);
  $: value = dataPoint(griddedData, lonLat);
</script>

<div
  use:tooltip={{content: value}}
  style="top: {y - 5}px; left: {x - 5}px"
  class:clip
  on:click={() => { pins.delete(pin); pins = pins}}
/>

<style>
  div {
    pointer-events: auto;
    height: 10px;
    width: 10px;
    position: absolute;
    background-color: red;
  }

  div.clip {
    display: none;
  }
</style>
