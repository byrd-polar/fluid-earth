<script>
  import tooltip from '../tooltip.js';
  import { dataPoint } from '../map/gridded.js';
  import { clipped } from '../map/projections/';
  import Hoverable from './Hoverable.svelte';

  export let pins;
  export let pin;
  export let d3geoProjection;
  export let griddedData;
  export let griddedDataset;

  let lonLat = [pin.longitude, pin.latitude];
  $: [x, y] = d3geoProjection(lonLat);
  $: clip = clipped(d3geoProjection, lonLat);
  $: value = dataPoint(griddedData, lonLat);
  $: lonDirection = pin.longitude >= 0 ? "E" : "W";
  $: latDirection = pin.latitude >= 0 ? "N" : "S";
</script>


<Hoverable let:hovering={hovering}>
  <div id="pin"
    style="left: {x - 16}px; top: {y - 21}px"
    class:clip
    on:click={() => { pins.delete(pin); pins = pins}}
  >
      <i class="icon-location"></i>
  </div>
  {#if hovering}
    <div
      style="left:{x-10}px;top:{y+5}px;"
      class="caption"
    >
      <span class="plain">
        Location {pin.id}
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
  #pin {
    pointer-events: auto;
    position: absolute;
  }

  #pin.clip {
    display: none;
  }

  @font-face {
    font-family: fontello;
    font-style: normal;
    font-weight: 400;
    src: url(../fonts/fontello.woff2) format("woff2"), url(../fonts/fontello.woff) format("woff"), url(../fonts/fontello.ttf) format("truetype")
  }

  [class*=" icon-"]:before, [class^=icon-]:before {
      -moz-osx-font-smoothing: grayscale;
      -webkit-font-feature-settings: normal;
      -webkit-font-smoothing: antialiased;
      display: inline-block;
      font-family: fontello;
      font-feature-settings: normal;
      font-style: normal;
      font-variant: normal;
      font-size: 1.5rem;
      font-weight: 400;
      line-height: 1.5rem;
      margin-left: .2em;
      margin-right: .2em;
      speak: none;
      text-align: center;
      text-decoration: inherit;
      text-transform: none;
      width: 1em;
      cursor: pointer;
      color: rgba(255, 0, 0, .9);
      text-shadow: 0 -2px 5px #000
  }

  .icon-location:before {
      content: "\E809";
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
