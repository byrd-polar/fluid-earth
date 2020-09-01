<script>
  import { onMount } from 'svelte';
  import Hammer from 'hammerjs';

  export let center;
  export let zoom;

  let interactionSurface;
  let manager;

  onMount(() => {
    manager = new Hammer.Manager(interactionSurface, {
      recognizers: [
        [Hammer.Pan, {
          threshold: 0,
        }],
      ],
    });
    manager.on('pan', e => handlePan(e));
  });

  let scale = 5 * window.devicePixelRatio;

  function handlePan(e) {
    center.longitude -= scale * e.velocityX / zoom;
    center.latitude += scale * e.velocityY / zoom;
  }

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
  bind:this={interactionSurface}
  on:wheel={handleWheel}
></div>

<svelte:window
  on:keydown={handleKeydown}
/>
