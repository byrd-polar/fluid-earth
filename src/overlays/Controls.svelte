<script>
  import { onMount } from 'svelte';
  import interact from 'interactjs';
  import { reproj } from '../map/projections/';
  import { clamp, modulo, genericLabel } from '../utility.js';

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

  let interactionSurfaceElement;
  let baseScale;
  let mouseEvent;

  // For ensuring scale of gestures is properly relative to actual size of
  // rendered map; see the screenRatio variable in Map.svelte for details
  function getPanFactor(e) {
    let screenRatio = e.target.clientHeight / 1080;
    let computedZoom = (portraitBasedZoom ? canvasRatio : 1) * zoom;
    return 0.25 / computedZoom / screenRatio;
  }

  // Get lon-lat coordinates of mouse/tap from event
  function getLocation(e, inverseProjectionFunction) {
    if (!e) return null;

    let rect = e.target.getBoundingClientRect();
    let point = [e.clientX - rect.left, e.clientY - rect.top];
    let lonLat = inverseProjectionFunction(point);
    return lonLat ? { longitude: lonLat[0], latitude: lonLat[1] } : null;
  }

  // make performing the 'hold' gesture on high ppi devices possible
  interact.pointerMoveTolerance(5);

  onMount(() => {
    interact(interactionSurfaceElement)
      .styleCursor(false)
      .draggable({
        inertia: true,
        listeners: {
          move (e) {
            let panFactor = getPanFactor(e);
            let lon = centerLongitude - panFactor * e.dx;
            let lat = centerLatitude + panFactor * e.dy;
            centerLongitude = modulo(lon, 360, -180);
            centerLatitude = clamp(lat, -90, 90);
          },
        },
      })
      .gesturable({
        listeners: {
          start (e) {
            baseScale = zoom;
          },
          move (e) {
            zoom = clamp(baseScale * e.scale, minZoom, maxZoom);
          },
        }
      })
      .on('hold', e => {
        let location = getLocation(e, inverseProjectionFunction);

        if (location) {
          pins = [{ label: genericLabel(pins), ...location }, ...pins];
        }
      });
    interactionSurfaceElement.addEventListener('wheel', handleWheel);

    // Workaround for browser chrome hiding/appearing too eagerly on Firefox on
    // Android, disables zooming with wheel if Firefox on Android is detected
    let ua = navigator.userAgent;
    if (ua.includes("Firefox") && ua.includes("Android")) {
      interactionSurfaceElement.removeEventListener('wheel', handleWheel);
    }
  });

  function handleWheel(e) {
    let z = zoom - 0.25 * Math.sign(e.deltaY);
    zoom = clamp(z, minZoom, maxZoom);
  }

  function handleMouse(e) {
    if (e.pointerType === 'touch') return;

    mouseEvent = e.type === 'pointerleave' ? null : e;
  }

  $: cursor = getLocation(mouseEvent, inverseProjectionFunction);
</script>

<div
  bind:this={interactionSurfaceElement}
  on:pointermove={handleMouse}
  on:pointerenter={handleMouse}
  on:pointerleave={handleMouse}
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
