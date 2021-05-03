<script>
  import debounce from 'debounce';
  import { onMount } from 'svelte';
  import { clamp, modulo } from './utility.js';
  import projections from './map/projections/';

  export let date
  export let griddedDataset;
  export let particleDataset;
  export let particlesShown;
  export let projection;
  export let centerLatitude;
  export let centerLongitude;
  export let zoom;

  export let inventory;
  export let minZoom;
  export let maxZoom;

  const debouncedSetHashFromAppState = debounce(setHashFromAppState, 100);

  // mapping of keys (in the hashURL) to their state variable representations
  $: stateObj = {
    date:   date.toISOString(),
    g:      griddedDataset.name,
    p:      particleDataset.name,
    pshow:  particlesShown,
    proj:   projection.name,
    lat:    centerLatitude,
    lon:    centerLongitude,
    zoom:   zoom,
  };
  $: debouncedSetHashFromAppState(stateObj);

  onMount(setAppStateFromHash);

  function setHashFromAppState(stateObj) {
    let hash = new URLSearchParams(stateObj);
    window.history.replaceState(null, '', `#${hash}`);
  }

  function setAppStateFromHash() {
    if (!window.location.hash) return;

    let hash = new URLSearchParams(window.location.hash.slice(1));

    // for each variable, get value from hash, and update variable if valid
    let val;

    val = new Date(hash.get('date'));
    if (!isNaN(val)) {
      date = val;
    }

    val = inventory.find(d => d.name === hash.get('g'));
    if (val) {
      griddedDataset = val;
    }

    val = inventory.find(d => d.name === hash.get('p'));
    if (val) {
      particleDataset = val;
    }

    val = hash.get('pshow');
    if (val === 'true' || val === 'false') {
      particlesShown = (val === 'true');
    }

    val = Object.values(projections).find(p => p.name === hash.get('proj'));
    if (val) {
      projection = val;
    }

    val = parseFloat(hash.get('lat'));
    if (!isNaN(val)) {
      centerLatitude = clamp(val, -90, 90);
    }

    val = parseFloat(hash.get('lon'));
    if (!isNaN(val)) {
      centerLongitude = modulo(val, 360, -180);
    }

    val = parseFloat(hash.get('zoom'));
    if (!isNaN(val)) {
      zoom = clamp(val, minZoom, maxZoom);
    }

    // fix any invalid parts of the URL
    setHashFromAppState(stateObj);
  }
</script>

<svelte:window on:hashchange={setAppStateFromHash}/>
