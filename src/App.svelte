<script>
  import Hash, { HashAppState } from './Hash.svelte';
  import Channel from './Channel.svelte';
  import Navbar from './Navbar.svelte';
  import Drawer from './Drawer.svelte';
  import Menu from './Menu.svelte';
  import Starfield from './Starfield.svelte';
  import Kiosk from './Kiosk.svelte';

  import About from './menus/About.svelte';
  import Datasets from './menus/Datasets.svelte';
  import TimeMachine from './menus/TimeMachine.svelte';
  import Locations from './menus/Locations.svelte';
  import Projections from './menus/Projections.svelte';
  import DeveloperOnlyTools from './menus/DeveloperOnlyTools.svelte';
  import Feedback from './menus/Feedback.svelte';

  import Map from './map/Map.svelte';
  import projections from './map/projections/';

  import Queries from './overlays/Queries.svelte';
  import Widgets from './overlays/Widgets.svelte';
  import Loading from './overlays/Loading.svelte';
  import Surface from './overlays/Surface.svelte';

  import { GriddedDataset, ParticleDataset } from './datasets.js';
  import { randlon, randlat } from './math.js';
  import { simplify, translate } from './smode.js';
  import { currentDate, mobile } from './stores.js';
  import { getUnitFromDial } from './units.js';
  import { fetchJson } from './utility.js';

  import Help from 'carbon-icons-svelte/lib/Help.svelte';
  import Location from 'carbon-icons-svelte/lib/Location.svelte';
  import ChartLineSmooth from 'carbon-icons-svelte/lib/ChartLineSmooth.svelte';
  import Calendar from 'carbon-icons-svelte/lib/Calendar.svelte';
  import ChoroplethMap from 'carbon-icons-svelte/lib/ChoroplethMap.svelte';
  import RequestQuote from 'carbon-icons-svelte/lib/RequestQuote.svelte';
  import Debug from 'carbon-icons-svelte/lib/Debug.svelte';

  export let gDatasets;
  export let pDatasets;

  const minZoom = 0.375;
  const maxZoom = 24;

  const minLat = -90;
  const maxLat = 90;
  const minLong = -360;
  const maxLong = 360;

  let hash = new HashAppState(gDatasets, pDatasets, minZoom, maxZoom);

  let openedMenu = null;
  let drawerOpen = false;

  let simplifiedMode = hash.smode ?? true;
  let kioskMode = hash.kmode ?? false;

  let griddedDataset
    = hash.gdata
    ?? gDatasets.find(d => d.name === 'temperature at 2 m above ground')
    ?? gDatasets[0];
  let displayedGriddedDataset = griddedDataset;

  let particleDataset
    = hash.pdata
    ?? pDatasets.find(d => d.name === 'wind at 10 m above ground')
    ?? pDatasets[0];
  let displayedParticleDataset = particleDataset;

  let timeDataset = getTimeDataset(griddedDataset, particleDataset);
  let displayedTimeDataset = timeDataset;

  let date = hash.date ?? ((__production__ || !__using_local_data_files__)
    ? griddedDataset.closestValidDate($currentDate)
    : griddedDataset.end);
  let anchorDate = date;
  let displayedDate = date;

  let projection = hash.proj ?? projections.VERTICAL_PERSPECTIVE;
  let forwardProjectionFunction = projection.function;
  let inverseProjectionFunction = projection.function.invert;
  let canvasRatio = 1;

  let centerLongitude = hash.lon ?? randlon();
  let centerLatitude = hash.lat ?? randlat();
  let zoom = hash.zoom ?? 1.5;

  let vectorData = { objects: {} };
  let vectorColors = {};

  let griddedData = griddedDataset.emptyData;
  let griddedName = griddedDataset.name;
  let griddedColormap = griddedDataset.colormap;
  let griddedDomain = griddedDataset.domain;
  let griddedScale = griddedDataset.scale;
  let griddedUnit = griddedDataset.unit;

  let particleData = particleDataset.emptyData;
  let particleName = particleDataset.name;
  let particlesPaused = false;
  let particleLifetime = particleDataset.particleLifetime;
  let particleCount = particleDataset.particleCount;
  let particleDisplay = particleDataset.particleDisplay;

  let utc = false;
  let pins = hash.pins ?? [];
  let cursor = null;

  $: portraitBasedZoom = $mobile;

  $: menus = [
    { name: 'Help & About', icon: Help },
    { name: 'Datasets', icon: ChartLineSmooth },
    { name: 'Time Machine', icon: Calendar },
    { name: 'Projections', icon: ChoroplethMap },
    kioskMode ? null : { name: 'Markers', icon: Location },
    kioskMode ? null : { name: 'Feedback', icon: RequestQuote },
    __production__ ? null : { name: 'Developer-Only Tools', icon: Debug },
  ].filter(m => m !== null);

  $: applyMode(simplifiedMode);

  $: anchorDate = date;
  $: timeDataset = getTimeDataset(griddedDataset, particleDataset);
  $: fixDate(timeDataset);

  $: hideParticlesIfTooFar(date);
  $: updateDataAndVariables(griddedDataset, particleDataset, date);

  function applyMode(simplifiedMode) {
    let dataset = displayedGriddedDataset;

    dataset = simplifiedMode ? simplify(dataset) : dataset;
    griddedName = dataset.name;
    griddedDomain = dataset.domain;
    griddedScale = dataset.scale;
    griddedColormap = dataset.colormap;

    dataset = displayedParticleDataset;
    particleName = simplifiedMode ? translate(dataset.name) : dataset.name;
  }

  function getTimeDataset(griddedDataset, particleDataset) {
    return griddedDataset === GriddedDataset.none
        && particleDataset !== particleDataset.none
        ? particleDataset
        : griddedDataset;
  }

  function fixDate(timeDataset) {
    let valid = timeDataset.closestValidDate(anchorDate);
    if (date.getTime() !== valid.getTime())
      date = valid;
  }

  function hideParticlesIfTooFar(date) {
    if (!particleDataset.isCloseDate(date))
      particleDataset = ParticleDataset.none;
  }

  let controller = new AbortController();
  let timesCalled = 0;

  async function updateDataAndVariables(griddedDataset, particleDataset, date) {
    // ignore the call to this on initial page load;
    // update the data manually below instead
    if (timesCalled < 1) { timesCalled++; return; }

    controller.abort();
    controller = new AbortController();
    let { signal } = controller;

    let datasets = [griddedDataset, particleDataset];
    let data = await Promise.all(datasets.map(d => getData(d, date, signal)));
    if (!data[0] || !data[1]) return;

    if (griddedData !== data[0]) griddedData = data[0];
    if (particleData !== data[1]) particleData = data[1];

    if (griddedDataset !== displayedGriddedDataset) {
      displayedGriddedDataset = griddedDataset;

      let dataset = simplifiedMode ? simplify(griddedDataset) : griddedDataset;
      griddedName = dataset.name;
      griddedDomain = dataset.domain;
      griddedScale = dataset.scale;
      griddedColormap = dataset.colormap;
      griddedUnit = getUnitFromDial(dataset.unit);
    }

    if (particleDataset !== displayedParticleDataset) {
      displayedParticleDataset = particleDataset;

      let dataset = particleDataset;
      particleName = simplifiedMode ? translate(dataset.name) : dataset.name;
      particleLifetime = dataset.particleLifetime;
      particleCount = dataset.particleCount;
      particleDisplay = dataset.particleDisplay;
    }

    if (displayedDate.getTime() !== date.getTime())
      displayedDate = date;

    if (displayedTimeDataset !== timeDataset)
      displayedTimeDataset = timeDataset;
  }

  async function getData(dataset, date, signal) {
    try {
      return await dataset.fetchData(date, signal);
    } catch(e) {
      if (e.name === 'AbortError') return false;
      console.error(e);
      return dataset.emptyData;
    }
  }

  griddedDataset.fetchData(date, controller.signal)
    .then(data => griddedData = data)

  particleDataset.fetchData(date, controller.signal)
    .then(data => particleData = data)

  fetchVectorData().then(fadeSplashScreen);

  async function fetchVectorData() {
    vectorData = await fetchJson('/tera/topology.json.br');
    vectorColors = {
      ne_50m_coastline: [255, 255, 255, 1],
      ne_50m_lakes: [255, 255, 255, 1],
      ne_50m_rivers_lake_centerlines: [255, 255, 255, 0.5],
      ne_50m_graticules_10: [255, 255, 255, 0.1],
    };
  }

  function fadeSplashScreen() {
    const splashElement = document.getElementById('splash');
    if (!splashElement) return;

    splashElement.classList.add('faded');
    setTimeout(
      () => splashElement.remove(),
      1000 * parseFloat(getComputedStyle(splashElement)['transitionDuration'])
    );
  }
</script>

<div class="wrapper">
<Hash
  bind:date
  bind:griddedDataset
  bind:particleDataset
  bind:projection
  bind:centerLatitude
  bind:centerLongitude
  bind:zoom
  bind:simplifiedMode
  bind:kioskMode
  bind:pins
  {gDatasets}
  {pDatasets}
  {minZoom}
  {maxZoom}
/>
{#if 'BroadcastChannel' in window}
  <Channel
    bind:centerLatitude
    bind:centerLongitude
    bind:zoom
    bind:date
  />
{/if}
<Navbar
  {menus}
  bind:openedMenu
  bind:drawerOpen
/>
<Drawer
  {menus}
  bind:openedMenu
  bind:drawerOpen
  {kioskMode}
/>
<Menu bind:openedMenu menuName="Help & About">
  <About
    {kioskMode}
  />
</Menu>
<Menu bind:openedMenu menuName="Datasets" bind:simplifiedMode>
  <Datasets
    {date}
    {gDatasets}
    {pDatasets}
    bind:griddedDataset
    bind:particleDataset
    {simplifiedMode}
  />
</Menu>
<Menu bind:openedMenu menuName="Time Machine">
  <TimeMachine
    bind:date
    bind:particleDataset
    {utc}
    {timeDataset}
  />
</Menu>
<Menu bind:openedMenu menuName="Projections">
  <Projections
    bind:projection
    bind:centerLongitude
    bind:centerLatitude
    bind:zoom
  />
</Menu>
{#if !kioskMode}
  <Menu bind:openedMenu menuName="Markers">
    <Locations
      bind:centerLongitude
      bind:centerLatitude
      bind:zoom
      bind:pins
      {griddedData}
      {griddedUnit}
    />
  </Menu>
  <Menu bind:openedMenu menuName="Feedback">
    <Feedback
    />
  </Menu>
{/if}
<!-- svelte-ignore missing-declaration -->
{#if !__production__}
  <Menu bind:openedMenu menuName="Developer-Only Tools">
    <DeveloperOnlyTools
      {minZoom}
      {maxZoom}
      bind:zoom
      {minLat}
      {maxLat}
      {minLong}
      {maxLong}
      bind:centerLatitude
      bind:centerLongitude
      {gDatasets}
      {pDatasets}
      bind:griddedDataset
      bind:particleDataset
      bind:griddedColormap
      bind:projection
    />
  </Menu>
{/if}
<main>
  <Map
    {projection}
    {centerLongitude}
    {centerLatitude}
    {zoom}
    {portraitBasedZoom}
    {griddedData}
    {griddedColormap}
    {griddedDomain}
    {griddedScale}
    {particleData}
    {particlesPaused}
    {particleLifetime}
    {particleCount}
    {particleDisplay}
    {vectorData}
    {vectorColors}
    bind:forwardProjectionFunction
    bind:inverseProjectionFunction
    bind:canvasRatio
  >
    <svelte:fragment slot="background">
      <Starfield hidden={!projection.starfield} />
    </svelte:fragment>
    <Surface
      {minZoom}
      {maxZoom}
      bind:centerLongitude
      bind:centerLatitude
      bind:zoom
      {portraitBasedZoom}
      {canvasRatio}
      {inverseProjectionFunction}
      bind:pins
      bind:cursor
      {kioskMode}
    />
    <Queries
      bind:pins
      {cursor}
      {forwardProjectionFunction}
      {griddedData}
      {griddedUnit}
      {griddedDomain}
      {griddedScale}
      {griddedColormap}
      {kioskMode}
    />
    <Loading />
    <Widgets
      bind:openedMenu
      {displayedDate}
      {displayedTimeDataset}
      bind:utc
      bind:zoom
      {minZoom}
      {maxZoom}
      {griddedName}
      {griddedColormap}
      {griddedDomain}
      {griddedScale}
      {griddedData}
      bind:griddedUnit
      {particleName}
      {particleDisplay}
      bind:particlesPaused
      {simplifiedMode}
      {kioskMode}
    />
  </Map>
</main>
</div>
<Kiosk {kioskMode} />

<style>
  div.wrapper {
    flex: 1;
    display: flex;
    flex-direction: row;
    position: relative;
  }

  main {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
</style>
