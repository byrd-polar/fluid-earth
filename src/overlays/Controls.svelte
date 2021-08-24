<script>
  import { onMount } from 'svelte';
  import interact from 'interactjs';
  import { reproj } from '../map/projections/';
  import { clamp, modulo, genericLabel } from '../utility.js';
  import { mobile } from '../stores.js';

  export let minZoom;
  export let maxZoom;

  export let centerLongitude;
  export let centerLatitude;
  export let zoom;
  export let canvasRatio;

  export let inverseProjectionFunction;
  export let pins;

  let interactionSurfaceElement;
  let screenRatio; // ratio of element height to our reference height
  let baseScale;

  // For ensuring scale of gestures is properly relative to actual size of
  // rendered map; see the screenRatio variable in Map.svelte for details
  let elementHeight = 1080;
  $: screenRatio = elementHeight / 1080;

  // make performing the 'hold' gesture on high ppi devices possible
  interact.pointerMoveTolerance(5);

  $: panFactor = 0.25 / zoom / screenRatio / ($mobile ? canvasRatio : 1);

  onMount(() => {
    interact(interactionSurfaceElement)
      .styleCursor(false)
      .draggable({
        inertia: true,
        listeners: {
          move (e) {
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
        let rect = interactionSurfaceElement.getBoundingClientRect();
        let point = [e.clientX - rect.left, e.clientY - rect.top];
        let lonLat = inverseProjectionFunction(point);

        if (lonLat) {
          let [longitude, latitude] = lonLat;
          pins = [{ label: genericLabel(pins), longitude, latitude }, ...pins];
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
</script>

<div
  bind:this={interactionSurfaceElement}
  bind:clientHeight={elementHeight}
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
