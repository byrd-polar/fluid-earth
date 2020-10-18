<script>
  import { onMount } from 'svelte';
  import interact from 'interactjs';

  export let center;
  export let zoom;

  let interactionSurfaceElement;
  let baseScale;

  const PAN_FACTOR = 0.25 * window.devicePixelRatio;
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 15;

  onMount(() => {
    interact(interactionSurfaceElement)
      .draggable({
        inertia: true,
        listeners: {
          move (e) {
            let lon = center.longitude - PAN_FACTOR * e.dx / zoom;
            let lat = center.latitude + PAN_FACTOR * e.dy / zoom;
            center.longitude = ((lon + 180) % 360) - 180;
            center.latitude = clamp(lat, -90, 90);
          },
        },
      })
      .gesturable({
        listeners: {
          start (e) {
            baseScale = zoom;
          },
          move (e) {
            zoom = clamp(baseScale * e.scale, MIN_ZOOM, MAX_ZOOM);
          },
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
    zoom = clamp(z, MIN_ZOOM, MAX_ZOOM);
  }

  function clamp(x, min, max) {
    return x > max ? max : (x < min ? min : x);
  }
</script>

<div bind:this={interactionSurfaceElement}></div>

<style>
  div {
    touch-action: none;
  }
</style>
