<script>
  import { onMount } from 'svelte';
  import interact from 'interactjs';

  export let center;
  export let zoom;

  let interactionSurfaceElement;
  let baseScale;

  const panFactor = 0.25 * window.devicePixelRatio;

  onMount(() => {
    interact(interactionSurfaceElement)
      .draggable({
        inertia: true,
        listeners: {
          move (e) {
            center.longitude -= panFactor * e.dx / zoom;
            center.latitude += panFactor * e.dy / zoom;
          },
        },
      })
      .gesturable({
        listeners: {
          start (e) {
            baseScale = zoom;
          },
          move (e) {
            zoom = baseScale * e.scale;
          },
        }
      });
    window.addEventListener('wheel', handleWheel);

    // Workaround for pinch-to-zoom (geturable-move) not working on Firefox on
    // Android, disables zooming with wheel if Firefox on Android is detected
    let ua = navigator.userAgent;
    if (ua.includes("Firefox") && ua.includes("Android")) {
      window.removeEventListener('wheel', handleWheel);
    }
  });

  function clamp(x, min, max) {
    return x > max ? max : (x < min ? min : x);
  }

  $: center.latitude = clamp(center.latitude, -90, 90);
  $: center.longitude = ((center.longitude + 180) % 360) - 180;
  $: zoom = clamp(zoom, 0.5, 15);

  const speed = 1;

  function handleKeydown(event) {
    switch(event.key) {
      case 'ArrowUp':
      case 'w':
        center.latitude += speed;
        break;
      case 's':
      case 'ArrowDown':
        center.latitude -= speed;
        break;
      case 'd':
      case 'ArrowRight':
        center.longitude += speed;
        break;
      case 'a':
      case 'ArrowLeft':
        center.longitude -= speed;
        break;
    }
  }

  function handleWheel(e) {
    zoom += e.deltaY * -0.01;
  }
</script>

<div
  bind:this={interactionSurfaceElement}
></div>

<svelte:window
  on:keydown={handleKeydown}
/>

<style>
  div {
    touch-action: none;
  }
</style>
