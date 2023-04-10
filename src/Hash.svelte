<script context="module">
  import { ParticleDataset } from './datasets.js';
  import { clamp, modulo } from './math.js';
  import projections from './map/projections/';

  export class HashAppState {
    constructor(gDatasets, pDatasets, minZoom, maxZoom) {
      this.gDatasets = gDatasets;
      this.pDatasets = pDatasets;
      this.minZoom = minZoom;
      this.maxZoom = maxZoom;
      this.refresh();
    }

    refresh() {
      this.hash = new URLSearchParams(window.location.hash?.slice(1));
    }

    get date() {
      let val = this.hash.has('date') ? new Date(this.hash.get('date')) : NaN;
      return isNaN(val) || (this.gdata === undefined)
        ? undefined
        : this.gdata.closestValidDate(val);
    }

    get gdata() {
      let name = this.hash.get('gdata');
      if (name === 'permafrost zones') name = 'permafrost probability';
      return this.gDatasets.find(d => d.name === name);
    }

    get pdata() {
      return (this.pshow === false)
        ? ParticleDataset.none
        : this.pDatasets.find(d => d.name === this.hash.get('pdata'));
    }

    // no longer used in hash output, kept to transition old hash urls to new
    get pshow() {
      let val = this.hash.get('pshow');
      return (val === 'true' || val === 'false') ? (val === 'true') : undefined;
    }

    get proj() {
      return Object.values(projections)
        .find(p => p.name === this.hash.get('proj'));
    }

    get lat() {
      let val = parseFloat(this.hash.get('lat'));
      return isNaN(val) ? undefined : clamp(val, -90, 90);
    }

    get lon() {
      let val = parseFloat(this.hash.get('lon'));
      return isNaN(val) ? undefined : modulo(val, 360, -180);
    }

    get zoom() {
      let val = parseFloat(this.hash.get('zoom'));
      return isNaN(val) ? undefined : clamp(val, this.minZoom, this.maxZoom);
    }

    get smode() {
      let val = this.hash.get('smode');
      return (val === 'true' || val === 'false') ? (val === 'true') : undefined;
    }

    get kmode() {
      let val = this.hash.get('kmode');
      return (val === 'true' || val === 'false') ? (val === 'true') : undefined;
    }

    get pins() {
      let val;
      try { val = JSON.parse(this.hash.get('pins')); }
      catch { return undefined; }

      if (!Array.isArray(val)) return undefined;

      return val
        .filter(p => {
          return typeof p.label === 'string'
              && typeof p.latitude === 'number'
              && typeof p.longitude === 'number';
        })
        .map(p => {
          return {
            label: p.label,
            latitude: clamp(p.latitude, -90, 90),
            longitude: modulo(p.longitude, 360, -180),
          };
        });
    }
  }
</script>

<script>
  import debounce from 'debounce';

  export let date;
  export let griddedDataset;
  export let particleDataset;
  export let projection;
  export let centerLatitude;
  export let centerLongitude;
  export let zoom;
  export let simplifiedMode;
  export let kioskMode;
  export let pins;

  export let gDatasets;
  export let pDatasets;
  export let minZoom;
  export let maxZoom;

  const debouncedSetHashFromAppState = debounce(setHashFromAppState, 100);

  // mapping of keys (in the hashURL) to their state variable representations
  $: stateObj = {
    date:   date.toISOString(),
    gdata:  griddedDataset.name,
    pdata:  particleDataset.name,
    proj:   projection.name,
    lat:    centerLatitude.toFixed(2),
    lon:    centerLongitude.toFixed(2),
    zoom:   zoom.toFixed(2),
    smode:  simplifiedMode,
    kmode:  kioskMode,
    pins:   JSON.stringify(pins),
  };
  $: debouncedSetHashFromAppState(stateObj);

  function setHashFromAppState(stateObj) {
    let hash = new URLSearchParams(stateObj);
    window.history.replaceState(null, '', `#${hash}`);
  }

  let hash = new HashAppState(gDatasets, pDatasets, minZoom, maxZoom);

  function setAppStateFromHash() {
    hash.refresh();

    let val;
    val = hash.date;  if (val !== undefined) date = val;
    val = hash.gdata; if (val !== undefined) griddedDataset = val;
    val = hash.pdata; if (val !== undefined) particleDataset = val;
    val = hash.proj;  if (val !== undefined) projection = val;
    val = hash.lat;   if (val !== undefined) centerLatitude = val;
    val = hash.lon;   if (val !== undefined) centerLongitude = val;
    val = hash.zoom;  if (val !== undefined) zoom = val;
    val = hash.smode; if (val !== undefined) simplifiedMode = val;
    val = hash.kmode; if (val !== undefined) kioskMode = val;
    val = hash.pins;  if (val !== undefined) pins = val;

    // fix any invalid parts of the URL
    setHashFromAppState(stateObj);
  }
</script>

<svelte:window on:hashchange={setAppStateFromHash}/>
