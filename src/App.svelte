<script>
  import Hash from './Hash.svelte';
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
  import {
    fetchJson,
    validDate, validCloseDate, validUnit,
    simplifyDataset,
  } from './utility.js';
  import { currentDate, mobile } from './stores.js';

  import { onMount } from 'svelte';

  export let gDatasets;
  export let pDatasets;

  const minZoom = 0.375;
  const maxZoom = 24;

  const minLat = -90;
  const maxLat = 90;
  const minLong = -360;
  const maxLong = 360;

  let openedMenu = null;
  let drawerOpen = false;

  let simplifiedMode = true;
  let kioskMode = false;

  let griddedDataset
    = gDatasets.find(d => d.name === 'temperature at 2 m above ground')
    ?? gDatasets[0];

  let particleDataset
    = pDatasets.find(d => d.name === 'wind at 10 m above ground')
    ?? pDatasets[0];

  let date = (__production__ || !__using_local_data_files__) ?
    validDate(griddedDataset, $currentDate) :
    griddedDataset.end;
  let displayDate = date;

  // always equal to date unless date is re-assigned in updateGriddedData
  $: anchorDate = date;

  // see comment in onMount
  let updateGriddedData = () => {};
  let updateParticleData = () => {};

  let projection = projections.VERTICAL_PERSPECTIVE;
  let forwardProjectionFunction = projection.function;
  let inverseProjectionFunction = projection.function.invert;
  let canvasRatio = 1;
  let centerLongitude = 360 * Math.random() - 180;
  let centerLatitude = (180 / Math.PI) * Math.asin(2 * Math.random() - 1);
  let zoom = 1.5;
  $: portraitBasedZoom = $mobile;

  let griddedData = GriddedDataset.emptyData;
  let griddedName = griddedDataset.name;
  let griddedColormap = griddedDataset.colormap;
  let griddedDomain = griddedDataset.domain;
  let griddedScale = griddedDataset.scale;
  let griddedOriginalUnit = griddedData.originalUnit;
  let preferredUnits = {
    speed: ['km/h', 'm/s', 'kn', 'mph'],
    temperature: ['tempC', 'tempF', 'tempK'],
    pressure: ['hPa', 'atm', 'mmHg', 'inHg'],
    length: ['m', 'ft'],
    area_density: [
      '0.01 Mg/m^2', // cm of rainfall
      '0.0254 Mg/m^2', // inches of rainfall
      'kg/m^2',
    ],
  };
  // Keep griddedUnit in sync with griddedData, not griddedDataset
  $: griddedUnit = validUnit(griddedData.unit, preferredUnits);
  $: griddedOriginalUnit = griddedData.originalUnit;

  let particleData = ParticleDataset.emptyData;

  let vectorData = { objects: {} };
  let vectorColors = {
    // update the following if sources for topology.json change
    ne_50m_coastline: [255, 255, 255, 1],
    ne_50m_lakes: [255, 255, 255, 1],
    ne_50m_rivers_lake_centerlines: [255, 255, 255, 0.5],
    ne_50m_graticules_10: [255, 255, 255, 0.1],
  };

  let particlesShown = true;
  $: if (!particlesShown) {
    particleData = ParticleDataset.emptyData;
  }
  let particleName = particleDataset.name;
  let particlesPaused = false;
  let particleLifetime = particleDataset.particleLifetime;
  let particleCount = particleDataset.particleCount;
  let particleDisplay = particleDataset.particleDisplay;

  let utc = false;
  let pins = [];
  let cursor = null;

  let previousGriddedDataset, previousParticleDataset;
  let currentlySetGriddedDataset;

  function setGriddedVariables(dataset, simplifiedMode) {
    currentlySetGriddedDataset = dataset;
    dataset = simplifiedMode ? simplifyDataset(dataset) : dataset;
    if (previousGriddedDataset === dataset) return;

    griddedName = dataset.name;
    griddedDomain = dataset.domain;
    griddedScale = dataset.scale;
    griddedColormap = dataset.colormap;

    previousGriddedDataset = dataset;
  }

  function setParticleVariables(dataset) {
    if (previousParticleDataset === dataset) return;

    particleName = dataset.name;
    particleLifetime = dataset.particleLifetime;
    particleCount = dataset.particleCount;
    particleDisplay = dataset.particleDisplay;

    previousParticleDataset = dataset;
  }

  function applyMode(simplifiedMode) {
    if (!currentlySetGriddedDataset) return;

    setGriddedVariables(currentlySetGriddedDataset, simplifiedMode);
  }

  $: applyMode(simplifiedMode);

  onMount(async () => {
    await Promise.all([loadTopology(), loadDatasets()]);
    removeSplash();
  });

  async function loadTopology() {
    vectorData = await fetchJson('/tera/topology.json.br');
  }

  async function loadDatasets() {
    // Methods for updating gridded and particle data in response to date or
    // dataset changes. Defined here so that they aren't triggered multiple
    // times during the initial mount due to a Svelte bug with bindings.

    let griddedLoading = false;
    let particleLoading = false;
    let griddedController;
    let particleController;
    let griddedAssignments = () => {};
    let particleAssignments = () => {};
    let initialLoad = true;

    updateGriddedData = async (griddedDataset) => {
      // Ensure that original date is switched back to if switching to and back
      // from a griddedDataset with different values from validDate
      if (anchorDate.getTime() !== date.getTime()) {
        date = anchorDate;
      }

      let valid = validDate(griddedDataset, date);
      if (valid.getTime() !== date.getTime()) {
        date = valid;
      }

      griddedController?.abort();
      griddedController = new AbortController();
      let { signal } = griddedController;

      griddedLoading = true;

      let data;
      try {
        data = await griddedDataset.fetchData(date, signal);
      } catch(e) {
        if (e.name === 'AbortError') return;
        data = GriddedDataset.emptyData;
      } finally {
        griddedLoading = false;
      }

      griddedAssignments = () => {
        griddedData = data;
        setGriddedVariables(griddedDataset, simplifiedMode);
      };

      // wait until complementary particle dataset is finished loading before
      // updating the map (avoids partial updates), except on initial load
      if (!particleLoading || initialLoad) assignVariables();
    };

    updateParticleData = async (particleDataset) => {
      let valid = validCloseDate(particleDataset, date);
      if (!valid) {
        particlesShown = false;
      }

      if (!particlesShown) return;

      particleController?.abort();
      particleController = new AbortController();
      let { signal } = particleController;

      particleLoading = true;

      let data;
      try {
        data = await particleDataset.fetchData(valid, signal);
      } catch(e) {
        if (e.name === 'AbortError') return;
        data = ParticleDataset.emptyData;
      } finally {
        particleLoading = false;
      }

      particleAssignments = () => {
        particleData = data;
        setParticleVariables(particleDataset);
      };

      // wait until complementary gridded dataset is finished loading before
      // updating the map (avoids partial updates), except on initial load
      if (!griddedLoading || initialLoad) assignVariables();
    };

    // update both gridded and particle datasets at the same time (if necessary)
    function assignVariables() {
      displayDate = date;
      griddedAssignments();
      particleAssignments();
      griddedAssignments = () => {};
      particleAssignments = () => {};
      initialLoad = false;
    }
  }

  function removeSplash() {
    // fade out and remove splash screen from index.html after loading
    const splashElement = document.getElementById('splash');
    if (splashElement) {
      splashElement.classList.add('faded');
      setTimeout(
        () => splashElement.remove(),
        1000 * parseFloat(getComputedStyle(splashElement)['transitionDuration'])
      );
    }
  }

  $: date, updateGriddedData(griddedDataset);
  $: date, particlesShown, updateParticleData(particleDataset);

  // Find new icons from: https://ibm.github.io/carbon-icons-svelte/
  //
  // Not using { Icon } import syntax for significantly faster build times
  import Help from 'carbon-icons-svelte/lib/Help.svelte';
  import Location from 'carbon-icons-svelte/lib/Location.svelte';
  import ChartLineSmooth from 'carbon-icons-svelte/lib/ChartLineSmooth.svelte';
  import Calendar from 'carbon-icons-svelte/lib/Calendar.svelte';
  import ChoroplethMap from 'carbon-icons-svelte/lib/ChoroplethMap.svelte';
  import RequestQuote from 'carbon-icons-svelte/lib/RequestQuote.svelte';
  import Debug from 'carbon-icons-svelte/lib/Debug.svelte';

  $: menus = [
    { name: 'Help & About', icon: Help },
    { name: 'Datasets', icon: ChartLineSmooth },
    { name: 'Time Machine', icon: Calendar },
    { name: 'Projections', icon: ChoroplethMap },
    kioskMode ? null : { name: 'Markers', icon: Location },
    kioskMode ? null : { name: 'Feedback', icon: RequestQuote },
    __production__ ? null : { name: 'Developer-Only Tools', icon: Debug },
  ].filter(m => m !== null);
</script>

<div class="wrapper">
<!--
  Note: for the attributes/props in the components below, {variable} is
  shorthand for variable={variable} and bind:variable is shorthand for
  bind:variable={variable}
-->
<Hash
  bind:date
  bind:griddedDataset
  bind:particleDataset
  bind:particlesShown
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
    bind:particlesShown
    {simplifiedMode}
  />
</Menu>
<Menu bind:openedMenu menuName="Time Machine">
  <TimeMachine
    bind:date
    {utc}
    {griddedDataset}
    {simplifiedMode}
    bind:particlesShown
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
    {particlesShown}
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
      {displayDate}
      bind:utc
      bind:zoom
      {minZoom}
      {maxZoom}
      {griddedName}
      {griddedColormap}
      {griddedDomain}
      {griddedScale}
      {griddedOriginalUnit}
      {griddedUnit}
      bind:preferredUnits
      {particleName}
      {particlesShown}
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
