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
  import Timelapse from './menus/Timelapse.svelte';
  import Locations from './menus/Locations.svelte';
  import Projections from './menus/Projections.svelte';
  import DeveloperOnlyTools from './menus/DeveloperOnlyTools.svelte';
  import Feedback from './menus/Feedback.svelte';

  import Map from './map/Map.svelte';
  import colormaps from './map/colormaps/';
  import projections from './map/projections/';
  import dataProjections, {
    singleArrayDataGet,
    pairedArrayDataGet,
  } from './map/data-projections/';

  import Queries from './overlays/Queries.svelte';
  import Widgets from './overlays/Widgets.svelte';
  import Loading from './overlays/Loading.svelte';
  import Surface from './overlays/Surface.svelte';

  import Fetcher from './fetcher.js';
  import {
    validDate, validCloseDate, validUnit,
    simplifyDataset,
  } from './utility.js';
  import { currentDate, mobile } from './stores.js';

  import { onMount } from 'svelte';
  import { Float16Array } from '@petamoriken/float16';

  export let inventory;

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

  const fetcher = new Fetcher();
  let griddedDataset = inventory.filter(d => d.colormap)[0];
  let particleDataset = inventory.filter(d => d.particleDisplay)[0];
  let date = (__production__ || !__using_local_data_files__) ?
    validDate(griddedDataset, $currentDate) :
    griddedDataset.lastForecast;

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

  let griddedData = {
    floatArray: new Float16Array([-Infinity]),
    width: 1,
    height: 1,
    originalUnit: griddedDataset.originalUnit,
    unit : griddedDataset.unit,
    projection: dataProjections.GFS,
    get: lonLat => NaN,
  };
  let griddedName = griddedDataset.name;
  let griddedColormap = griddedDataset.colormap;
  let griddedDomain = griddedDataset.domain;
  let griddedScale = griddedDataset.scale;
  let griddedOriginalUnit = griddedDataset.originalUnit;
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

  const emptyParticleData = {
    uVelocities: new Float16Array([0]),
    vVelocities: new Float16Array([0]),
    width: 1,
    height: 1,
    projection: dataProjections.GFS,
    get: lonLat => NaN,
  };
  let particleData = emptyParticleData;

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
    particleData = emptyParticleData;
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
    griddedOriginalUnit = dataset.originalUnit;
    griddedUnit = validUnit(dataset.unit, preferredUnits);

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
    // JS implementation of 100vh for mobile, see:
    // https://chanind.github.io/javascript/2019/09/28/avoid-100vh-on-mobile-web.html
    window.addEventListener('resize', () => {
      document.body.style.height = `${window.innerHeight}px`;
    });

    // Load topology (lines on globe) data completely first
    let topologyDataset = inventory.find(d => d.name === 'topology')
    vectorData = await fetcher.fetch(topologyDataset);

    setGriddedVariables(griddedDataset, simplifiedMode);
    setParticleVariables(particleDataset);

    // Methods for updating gridded and particle data in response to date or
    // dataset changes. Defined here so that they aren't triggered multiple
    // times during the initial mount due to a Svelte bug with bindings.

    let griddedLoading = false;
    let particleLoading = false;
    let griddedAssignments = () => {};
    let particleAssignments = () => {};
    let initialLoad = true;

    updateGriddedData = async (griddedDataset) => {
      griddedLoading = true;

      // Ensure that original date is switched back to if switching to and back
      // from a griddedDataset with different values from validDate
      if (anchorDate.getTime() !== date.getTime()) {
        date = anchorDate;
      }

      let valid = validDate(griddedDataset, date);
      if (valid.getTime() !== date.getTime()) {
        date = valid;
      }

      let array = await fetcher.fetch(griddedDataset, date, 'gridded');

      if (!array) return;

      griddedLoading = false;

      griddedAssignments = () => {
        griddedData = {
          floatArray: array,
          width: griddedDataset.width,
          height: griddedDataset.height,
          originalUnit: griddedDataset.originalUnit,
          unit : griddedDataset.unit,
          projection: griddedDataset.projection,
          get: lonLat => singleArrayDataGet(griddedData, lonLat),
        };

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

      particleLoading = true;

      let [uArray, vArray] =
        await fetcher.fetch(particleDataset, valid, 'particle');

      if (!uArray || !vArray) return;

      particleLoading = false;

      particleAssignments = () => {
        if (
          particleData.uVelocities !== uArray ||
          particleData.vVelocities !== vArray
        ) {
          particleData = {
            uVelocities: uArray,
            vVelocities: vArray,
            width: particleDataset.width,
            height: particleDataset.height,
            projection: particleDataset.projection,
            get: lonLat => pairedArrayDataGet(particleData, lonLat),
          };
        }

        setParticleVariables(particleDataset);
      };

      // wait until complementary gridded dataset is finished loading before
      // updating the map (avoids partial updates), except on initial load
      if (!griddedLoading || initialLoad) assignVariables();
    };

    // update both gridded and particle datasets at the same time (if necessary)
    function assignVariables() {
      griddedAssignments();
      particleAssignments();
      griddedAssignments = () => {};
      particleAssignments = () => {};
      initialLoad = false;
    }

    // fade out and remove splash screen from public/index.html after loading
    const splashElement = document.getElementById('splash');
    if (splashElement) {
      splashElement.classList.add('faded');
      setTimeout(
        () => splashElement.remove(),
        1000 * parseFloat(getComputedStyle(splashElement)['transitionDuration'])
      );
    }
  });

  $: date, updateGriddedData(griddedDataset);
  $: date, particlesShown, updateParticleData(particleDataset);

  // Find new icons from: https://ibm.github.io/carbon-icons-svelte/
  //
  // Not using { Icon } import syntax for significantly faster build times, see
  // https://github.com/IBM/carbon-icons-svelte#direct-import-recommended
  import Help24 from "carbon-icons-svelte/lib/Help24";
  import Location24 from "carbon-icons-svelte/lib/Location24";
  import ChartLineSmooth24 from "carbon-icons-svelte/lib/ChartLineSmooth24";
  import Calendar24 from "carbon-icons-svelte/lib/Calendar24";
  import DataPlayer24 from "carbon-icons-svelte/lib/DataPlayer24";
  import ChoroplethMap24 from "carbon-icons-svelte/lib/ChoroplethMap24";
  import RequestQuote24 from "carbon-icons-svelte/lib/RequestQuote24";
  import Debug24 from "carbon-icons-svelte/lib/Debug24";

  $: menus = [
    { name: 'Help & About', icon: Help24 },
    { name: 'Datasets', icon: ChartLineSmooth24 },
    { name: 'Time Machine', icon: Calendar24 },
    { name: 'Timelapse', icon: DataPlayer24 },
    { name: 'Projections', icon: ChoroplethMap24 },
    kioskMode ? null : { name: 'Markers', icon: Location24 },
    kioskMode ? null : { name: 'Feedback', icon: RequestQuote24 },
    __production__ ? null : { name: 'Developer-Only Tools', icon: Debug24 },
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
  {inventory}
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
    {inventory}
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
  />
</Menu>
<Menu bind:openedMenu menuName="Timelapse">
  <Timelapse
    {fetcher}
    {utc}
    {simplifiedMode}
    {griddedDataset}
    bind:date
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
      {inventory}
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
    <Loading {fetcher} />
    <Widgets
      bind:openedMenu
      {date}
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
