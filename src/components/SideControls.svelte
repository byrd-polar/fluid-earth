<script>
  import ZoomIn from 'carbon-icons-svelte/lib/ZoomIn.svelte';
  import ZoomOut from 'carbon-icons-svelte/lib/ZoomOut.svelte';
  import Shuffle from 'carbon-icons-svelte/lib/Shuffle.svelte';
  import LocationCurrent from 'carbon-icons-svelte/lib/LocationCurrent.svelte';
  import Tweener from '../tweener.js';
  import { cubicOut } from 'svelte/easing';
  import { clamp, randlon, randlat } from '../math.js';
  import tooltip from '../tooltip.js';

  export let zoom;
  export let minZoom;
  export let maxZoom;
  export let centerLongitude;
  export let centerLatitude;

  let tweener = new Tweener(z => zoom = z, {
    duration: 500,
    easing: cubicOut,
  });

  function smoothZoom(zoomIn) {
    let newZoom = zoomIn ? zoom * 2 : zoom / 2;
    tweener.tween(zoom, clamp(newZoom, minZoom, maxZoom));
  }

  let location = null;
  let loading = false;

  async function moveToMyLocation() {
    try {
      loading = true;
      location ??= await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          pos => resolve(pos.coords),
          reject,
        );
      });
    } catch(e) {
      console.error(e)
    } finally {
      loading = false;
    }
    if (location) {
      await moveTo(location);
    }
  }

  // TODO: refactor to remove duplication with src/menus/Locations.svelte

  let opts = {
    duration: 800,
    easing: cubicOut,
  }

  let lonTweener = new Tweener(c => centerLongitude = c, opts);
  let latTweener = new Tweener(c => centerLatitude = c, opts);
  let zoomTweener = new Tweener(z => zoom = z, opts);

  async function moveTo(city) {
    let zoomOutIn = zoom > 1.5;
    let originalZoom = zoom;

    if (zoomOutIn) await zoomTweener.tween(zoom, 1.5);

    // ensure the shorter way around is taken (across the anti-meridian)
    if (centerLongitude - city.longitude > 180) {
      centerLongitude -= 360;
    } else if (city.longitude - centerLongitude > 180) {
      centerLongitude += 360;
    }

    await Promise.all([
      lonTweener.tween(centerLongitude, city.longitude),
      latTweener.tween(centerLatitude, city.latitude),
    ]);

    if (zoomOutIn) await zoomTweener.tween(zoom, originalZoom);
  }
</script>

<div class="sidedock">
  <button
    aria-label="Zoom in"
    on:click={() => smoothZoom(true)}
    use:tooltip={{content: 'Zoom in', placement: 'left'}}
  >
    <ZoomIn size={24} />
  </button>
  <button
    aria-label="Zoom out"
    on:click={() => smoothZoom(false)}
    use:tooltip={{content: 'Zoom out', placement: 'left'}}
  >
    <ZoomOut size={24} />
  </button>
  <button
    aria-label="Fly to my location"
    on:click={moveToMyLocation}
    use:tooltip={{content: 'Fly to my location', placement: 'left'}}
    class:loading
    disabled={loading}
  >
    <LocationCurrent size={24} />
  </button>
  <button
    aria-label="Fly to random location"
    on:click={() => moveTo({ longitude: randlon(), latitude: randlat() })}
    use:tooltip={{content: 'Fly to random location', placement: 'left'}}
  >
    <Shuffle size={24} />
  </button>
</div>

<style>
  div.sidedock {
    background: var(--secondary-color-dark);
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: auto 0 auto auto;
    pointer-events: auto;
    padding: 8px 4px 8px 8px;
    border-radius: 24px 0 0 24px;
    filter: drop-shadow(0 0 2px black);
  }

  button {
    all: unset;
    display: flex;
    border-radius: 50%;
    background: var(--secondary-color);
    padding: 8px;
    cursor: pointer;
    transition: filter 0.25s ease 0s;
  }

  button:focus, button:hover {
    filter: brightness(125%);
  }

  button:focus:not(:focus-visible):not(:hover) {
    filter: none;
  }

  button.loading {
    position: relative;
  }

  button.loading::after {
    content: "";
    border: 3px solid transparent;
    border-right-color: var(--primary-color-light);
    width: 34px;
    height: 34px;
    left: 0;
    top: 0;
    position: absolute;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0turns);
    }
    to {
      transform: rotate(1turn);
    }
  }
</style>
