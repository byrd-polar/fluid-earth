<script>
  import { onMount } from 'svelte';
  import { reproj } from '../map/projections/';
  import { clamp, modulo } from '../math.js';
  import { genericLabel } from '../utility.js';

  export let minZoom;
  export let maxZoom;

  export let centerLongitude;
  export let centerLatitude;
  export let zoom;
  export let portraitBasedZoom;
  export let canvasRatio;

  export let inverseProjectionFunction;
  export let pins;
  export let cursor;

  export let kioskMode;

  let clientHeight = 1080;
  let dragCoords = null;
  let cursorEvent = null;

  // For ensuring scale of gestures is properly relative to actual size of
  // rendered map; see the screenRatio variable in Map.svelte for details
  $: screenRatio = clientHeight / 1080;
  $: computedZoom = (portraitBasedZoom ? canvasRatio : 1) * zoom;
  $: panFactor = 0.25 / computedZoom / screenRatio;

  $: cursor = cursorEvent
    ? getLocation(cursorEvent, inverseProjectionFunction)
    : null;

  function handlePointerdown(e) {
    e.target.setPointerCapture(e.pointerId);
    dragCoords = { x: e.clientX, y: e.clientY };
    cursorEvent = null;
  }

  function handlePointerup(e) {
    if (!dragCoords) return;

    e.target.releasePointerCapture(e.pointerId)
    dragCoords = null;
    cursorEvent = e;
  }

  function handlePointermove(e) {
    if (!dragCoords) {
      cursorEvent = e;
      return;
    }
    let lon = centerLongitude - panFactor * (e.clientX - dragCoords.x);
    let lat = centerLatitude + panFactor * (e.clientY - dragCoords.y);
    centerLongitude = modulo(lon, 360, -180);
    centerLatitude = clamp(lat, -90, 90);
    dragCoords = { x: e.clientX, y: e.clientY };
  }

  function handleWheel(e) {
    let z = e.deltaY > 0 ? zoom / 1.1 : zoom * 1.1;
    zoom = clamp(z, minZoom, maxZoom);
  }

  function getLocation(e, inverseProjectionFunction) {
    let rect = e.target.getBoundingClientRect();
    let point = [e.clientX - rect.left, e.clientY - rect.top];
    let lonLat = inverseProjectionFunction(point);
    return lonLat ? { longitude: lonLat[0], latitude: lonLat[1] } : null;
  }
</script>

<!--
  Listening for mouseup and contextmenu to work around
  https://bugzilla.mozilla.org/show_bug.cgi?id=1684355
-->
<div
  bind:clientHeight
  on:pointerdown={handlePointerdown}
  on:pointerup={handlePointerup}
  on:contextmenu={handlePointerup}
  on:mouseup={handlePointerup}
  on:pointermove={handlePointermove}
  on:wheel={handleWheel}
></div>

<style>
  div {
    touch-action: none;
    pointer-events: auto;
  }

  div:active {
    cursor: grabbing;
  }
</style>
