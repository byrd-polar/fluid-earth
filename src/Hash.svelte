<script>
  import debounce from 'debounce';
  import { onMount, tick } from 'svelte';
  import { clamp, modulo, validDate } from './utility.js';
  import projections from './map/projections/';

  export let date;
  export let griddedDataset;
  export let particleDataset;
  export let particlesShown;
  export let projection;
  export let centerLatitude;
  export let centerLongitude;
  export let zoom;
  export let simplifiedMode;
  export let kioskMode;
  export let pins;

  export let inventory;
  export let minZoom;
  export let maxZoom;

  const debouncedSetHashFromAppState = debounce(setHashFromAppState, 100);

  // mapping of keys (in the hashURL) to their state variable representations
  $: stateObj = {
    date:   date.toISOString(),
    gdata:  griddedDataset.name,
    pdata:  particleDataset.name,
    pshow:  particlesShown,
    proj:   projection.name,
    lat:    centerLatitude.toFixed(2),
    lon:    centerLongitude.toFixed(2),
    zoom:   zoom.toFixed(2),
    smode:  simplifiedMode,
    kmode:  kioskMode,
    pins:   JSON.stringify(pins),
  };
  $: debouncedSetHashFromAppState(stateObj);

  onMount(async () => {
    await tick(); // fixes parts of app not updating on initial load
    setAppStateFromHash();
  });

  let initialPageLoad = true;

  function setHashFromAppState(stateObj) {
    // avoid setting the hash based on initial value if hash already exists
    if (initialPageLoad) {
      initialPageLoad = false;
      if (window.location.hash) return;
    }

    let hash = new URLSearchParams(stateObj);
    window.history.replaceState(null, '', `#${hash}`);
  }

  function setAppStateFromHash() {
    if (!window.location.hash) return;

    let hash = new URLSearchParams(window.location.hash.slice(1));

    // for each variable, get value from hash, and update variable if valid
    let val;

    val = inventory.find(d => d.name === hash.get('gdata'));
    if (val) {
      griddedDataset = val;
    }

    val = inventory.find(d => d.name === hash.get('pdata'));
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

    val = hash.get('smode');
    if (val === 'true' || val === 'false') {
      simplifiedMode = (val === 'true');
    }

    val = hash.get('kmode');
    if (val === 'true' || val === 'false') {
      kioskMode = (val === 'true');
    }

    try {
      val = JSON.parse(hash.get('pins'));
    } catch {
      val = false;
    }
    if (Array.isArray(val) && val.every(pin => {
      let keys = Object.keys(pin);
      let expectedKeys = ['label', 'longitude', 'latitude'];

      return keys.length === expectedKeys.length
        && expectedKeys.every(key => keys.includes(key))
        && typeof pin.label === 'string'
        && typeof pin.latitude === 'number'
        && typeof pin.longitude === 'number';
    })) {
      pins = val.map(p => {
        return {
          label: p.label,
          latitude: clamp(p.latitude, -90, 90),
          longitude: modulo(p.longitude, 360, -180),
        };
      });
    }

    val = hash.has('date') ? new Date(hash.get('date')) : NaN;
    if (!isNaN(val)) {
      date = validDate(griddedDataset, val);
    }

    // fix any invalid parts of the URL
    setHashFromAppState(stateObj);
  }
</script>

<svelte:window on:hashchange={setAppStateFromHash}/>
