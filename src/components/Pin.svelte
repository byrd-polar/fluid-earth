<script>
  import { fly, fade } from 'svelte/transition';
  import PinIcon from 'carbon-icons-svelte/lib/LocationFilled.svelte';
  import { labelByName, prettyValue } from '../units.js';
  import { prettyLatLon } from '../utility.js';

  export let pins;
  export let pin;
  export let forwardProjectionFunction;
  export let griddedName;
  export let griddedData;
  export let griddedUnit;

  let lonLat = [pin.longitude, pin.latitude];
  let hovering = false;

  let x = 0, y = 0;
  $: point = forwardProjectionFunction(lonLat)
  $: clip = point === null;
  $: if (point) [x, y] = point;
  $: value = griddedData.get(lonLat);
  $: label = labelByName(value, griddedName);
</script>


<div
  class="pin"
  class:clip
  style="left: {x}px; top: {y}px;"
  in:fly="{{ y: -150, duration: 250 }}"
  out:fade="{{ duration: 250 }}"
>
  <button
    class="marker"
    style="z-index: {-1e8 + Math.round(y * 8)}"
    on:click={() => pins = pins.filter(p => p !== pin)}
    on:focus={() => hovering = true}
    on:blur={() => hovering = false}
    on:mouseenter={() => hovering = true}
    on:mouseleave={() => hovering = false}
  >
    <PinIcon size={32} />
  </button>
  {#if hovering}
    <div class="caption">
      <span class="plain">
        {#if pin.label}
          {pin.label}
        {:else}
          Location {pin.id}
        {/if}
        <br>
      </span>
      <strong class="bold">
        {prettyValue(value, griddedData.originalUnit, griddedUnit, label)}
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
    padding: 0;
    border: none;
    background-color: transparent;
    background-image: none;
  }

  div.pin > :global(.marker svg) {
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
