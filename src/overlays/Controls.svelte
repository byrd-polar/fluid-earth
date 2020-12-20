<script>
  import { onMount } from 'svelte';
  import interact from 'interactjs';
  import { reproj } from '../map/projections/';

  export let minZoom;
  export let maxZoom;

  export let centerLongitude;
  export let centerLatitude;
  export let zoom;

  export let d3geoProjection;
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

  const PAN_FACTOR = 0.25;

  onMount(() => {
    interact(interactionSurfaceElement)
      .draggable({
        inertia: true,
        listeners: {
          move (e) {
            let lon = centerLongitude - PAN_FACTOR * e.dx / zoom / screenRatio;
            let lat = centerLatitude + PAN_FACTOR * e.dy / zoom / screenRatio;
            centerLongitude = ((lon + 540) % 360) - 180;
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
        let [longitude, latitude] = d3geoProjection.invert(point);

        if (reproj(d3geoProjection, point, [longitude, latitude])) {
          pins.add({ longitude, latitude });
          pins = pins;
        }
      });
    interactionSurfaceElement.addEventListener('wheel', handleWheel);

    // Workaround for pinch-to-zoom (gesturable move) not working on Firefox on
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

  function clamp(x, min, max) {
    return x > max ? max : (x < min ? min : x);
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
</style>
