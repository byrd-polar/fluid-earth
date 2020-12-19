<script>
  import { proj } from '../map/projections/';
  export let pins;
  export let pin;
  export let projection;
  export let centerLongitude;
  export let centerLatitude;
  export let clientWidth;
  export let clientHeight;
  export let zoom;

  let x, y;
  let clip = false;

  $: [x, y] = proj(
    projection,
    centerLongitude,
    centerLatitude,
    clientWidth,
    clientHeight,
    zoom,
  )([pin.longitude, pin.latitude]);
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
