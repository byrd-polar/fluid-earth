<script>
  import ZoomIn from 'carbon-icons-svelte/lib/ZoomIn24';
  import ZoomOut from 'carbon-icons-svelte/lib/ZoomOut24';
  import Tweener from '../tweener.js';
  import { cubicOut } from 'svelte/easing';
  import { clamp } from '../math.js';
  import tooltip from '../tooltip.js';

  export let zoom;
  export let minZoom;
  export let maxZoom;

  let tweener = new Tweener(z => zoom = z, {
    duration: 500,
    easing: cubicOut,
  });

  function smoothZoom(zoomIn) {
    let newZoom = zoomIn ? zoom * 2 : zoom / 2;
    tweener.tween(zoom, clamp(newZoom, minZoom, maxZoom));
  }
</script>

<div class="sidedock">
  <button
    aria-label="Zoom in"
    on:click={() => smoothZoom(true)}
    use:tooltip={{content: 'Zoom in', placement: 'left'}}
  >
    <ZoomIn />
  </button>
  <button
    aria-label="Zoom out"
    on:click={() => smoothZoom(false)}
    use:tooltip={{content: 'Zoom out', placement: 'left'}}
  >
    <ZoomOut />
  </button>
</div>

<style>
  div.sidedock {
    background: var(--secondary-color-dark);
    display: flex;
    flex-direction: column;
    margin-left: auto;
    pointer-events: auto;
    padding: 0.5em 0.25em 0.5em 0.5em;
    border-radius: 1.5em 0 0 1.5em;
    filter: drop-shadow(0 0 0.125em black);
  }

  button {
    all: unset;
    display: flex;
    border-radius: 50%;
    background: var(--secondary-color);
    padding: 0.5em;
    cursor: pointer;
    transition: filter 0.25s ease 0s;
  }

  button + button {
    margin-top: 0.5em;
  }

  button:focus, button:hover {
    filter: brightness(125%);
  }

  button:focus:not(:focus-visible):not(:hover) {
    filter: none;
  }
</style>
