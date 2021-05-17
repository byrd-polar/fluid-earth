<script>
  import Hash from './Hash.svelte';
  import Navbar from './Navbar.svelte';
  import Drawer from './Drawer.svelte';
  import Menu from './Menu.svelte';

  import Datasets from './menus/Datasets.svelte';
  import TimeMachine from './menus/TimeMachine.svelte';
  import Locations from './menus/Locations.svelte';
  import MapProjections from './menus/MapProjections.svelte';
  import Colormaps from './menus/Colormaps.svelte';
  import Perspective from './menus/Perspective.svelte';
  import About from './menus/About.svelte';
  import Feedback from './menus/Feedback.svelte';

  import Map, { updateAllWebglResolutions } from './map/Map.svelte';
  import colormaps from './map/colormaps/';
  import projections from './map/projections/';
  import dataProjections, {
    singleArrayDataGet,
    pairedArrayDataGet,
  } from './map/data-projections/';

  import Pins from './overlays/Pins.svelte';
  import Legends from './overlays/Legends.svelte';
  import Loading from './overlays/Loading.svelte';
  import Controls from './overlays/Controls.svelte';

  import Fetcher from './fetcher.js';
  import { validDate } from './utility.js';

  import { onMount } from 'svelte';
  import { Float16Array } from '@petamoriken/float16';
  import Qty from 'js-quantities/esm';

  export let inventory;

  const minZoom = 0.5;
  const maxZoom = 15;

  const minLat = -90;
  const maxLat = 90;
  const minLong = -360;
  const maxLong = 360;

  let openedMenu = null;
  let drawerOpen = false;

  const storage = window.localStorage;
  let advancedOptions = JSON.parse(storage.getItem('advancedOptions')) || false;
  $: storage.setItem('advancedOptions', JSON.stringify(advancedOptions));

  const fetcher = new Fetcher();
  let griddedDataset = inventory.filter(d => d.colormap)[0];
  let particleDataset = inventory.filter(d => d.particleDisplay)[0];
  let date = __production__ ?
    validDate(griddedDataset, new Date()) :
    griddedDataset.lastForecast;

  // see comment in onMount
  let updateGriddedData = () => {};
  let updateParticleData = () => {};

  let projection = projections.VERTICAL_PERSPECTIVE;
  let d3geoProjection = projection.function;
  let MAX_TEXTURE_SIZE = Infinity;
  let centerLongitude = -60;
  let centerLatitude = 30;
  let zoom = 1.5;

  let griddedData = {
    floatArray: new Float16Array([-Infinity]),
    width: 1,
    height: 1,
    originalUnit: griddedDataset.originalUnit,
    projection: dataProjections.GFS,
    get: lonLat => NaN,
  };
  let griddedColormap = griddedDataset.colormap;
  let griddedDomain = griddedDataset.domain;
  let griddedUnit = griddedDataset.unit;
  let preferredUnits = {
    speed: ['km/h', 'm/s', 'kn', 'mph'],
    temperature: ['tempC', 'tempF', 'tempK'],
    pressure: ['hPa', 'mmHg', 'inHg'],
    length: ['m', 'ft'],
  };

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
    ne_50m_coastline: [1, 1, 1, 1],
    ne_50m_lakes: [1, 1, 1, 1],
    ne_50m_rivers_lake_centerlines: [1, 1, 1, 0.5],
    ne_50m_graticules_10: [1, 1, 1, 0.1],
  };

  let particlesShown = true;
  $: if (!particlesShown) {
    particleData = emptyParticleData;
  }
  let particlesPaused = false;
  let particleLifetime = 1000;
  let particleCount = 1e5;
  let particleDisplay = {
    size: 0.8,
    rate: 5e4,
    opacity: 0.4,
    fade: 0.96,
  };

  let utc = false;
  let pins = [];

  onMount(async () => {
    // workaround some race condition loading bugs
    setTimeout(updateAllWebglResolutions, 0.5);

    // JS implementation of 100vh for mobile, see:
    // https://chanind.github.io/javascript/2019/09/28/avoid-100vh-on-mobile-web.html
    window.addEventListener('resize', () => {
      document.body.style.height = `${window.innerHeight}px`;
      updateAllWebglResolutions();
    });

    // Load topology (lines on globe) data completely first
    let topologyDataset = inventory.find(d => d.name === 'topology')
    vectorData = await fetcher.fetch(topologyDataset);

    // Methods for updating gridded and particle data in response to date or
    // dataset changes. Defined here so that they aren't triggered multiple
    // times during the initial mount due to a Svelte bug with bindings.

    let previousGriddedDataset = null;
    let previousParticleDataset = null;
    let griddedLoading = false;
    let particleLoading = false;
    let griddedAssignments = () => {};
    let particleAssignments = () => {};
    let initialLoad = true;

    updateGriddedData = async () => {
      griddedLoading = true;

      let valid = validDate(griddedDataset, date);
      if (valid.getTime() !== date.getTime()) {
        date = valid;
      }

      // Set consistent units across datasets
      let unitList = preferredUnits[Qty(griddedDataset.unit).kind()];
      if (unitList && previousGriddedDataset !== griddedDataset) {
        griddedDataset.unit = unitList[0];
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
          projection: griddedDataset.projection,
          get: lonLat => singleArrayDataGet(griddedData, lonLat),
        };

        if (previousGriddedDataset !== griddedDataset) {
          griddedDomain = griddedDataset.domain;
          griddedColormap = griddedDataset.colormap;
          griddedUnit = griddedDataset.unit;

          previousGriddedDataset = griddedDataset;
        }
      };

      // wait until complementary particle dataset is finished loading before
      // updating the map (avoids partial updates), except on initial load
      if (!particleLoading || initialLoad) assignVariables();
    };

    updateParticleData = async () => {
      if (validDate(griddedDataset, date).getTime() !== date.getTime()) return;

      let valid = validDate(particleDataset, date);
      if (valid.getTime() !== date.getTime()) {
        particlesShown = false;
      }

      if (!particlesShown) return;

      particleLoading = true;

      let [uArray, vArray] =
        await fetcher.fetch(particleDataset, date, 'particle');

      if (!uArray || !vArray) return;

      particleLoading = false;

      particleAssignments = () => {
        particleData = {
          uVelocities: uArray,
          vVelocities: vArray,
          width: particleDataset.width,
          height: particleDataset.height,
          projection: particleDataset.projection,
          get: lonLat => pairedArrayDataGet(particleData, lonLat),
        };

        if (previousParticleDataset !== particleDataset) {
          particleLifetime = particleDataset.particleLifetime;
          particleCount = particleDataset.particleCount;
          particleDisplay = particleDataset.particleDisplay;

          previousParticleDataset = particleDataset;
        }
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
    splashElement.classList.add('faded');
    setTimeout(
      () => splashElement.remove(),
      1000 * parseFloat(getComputedStyle(splashElement)['transitionDuration'])
    );
  });

  $: date, griddedDataset, updateGriddedData();
  $: date, particleDataset, particlesShown, updateParticleData();

  // Find new icons from: https://ibm.github.io/carbon-icons-svelte/
  //
  // Not using { Icon } import syntax for significantly faster build times, see
  // https://github.com/IBM/carbon-icons-svelte#direct-import-recommended
  import Location24 from "carbon-icons-svelte/lib/Location24";
  import Grid24 from "carbon-icons-svelte/lib/Grid24";
  import Time24 from "carbon-icons-svelte/lib/Time24";
  import Globe24 from "carbon-icons-svelte/lib/Globe24";
  import ColorPalette24 from "carbon-icons-svelte/lib/ColorPalette24";
  import View24 from "carbon-icons-svelte/lib/View24";
  import Information24 from "carbon-icons-svelte/lib/Information24";
  import RequestQuote24 from "carbon-icons-svelte/lib/RequestQuote24";

  const defaultMenus = [
    { name: 'Datasets', icon: Grid24 },
    { name: 'Time Machine', icon: Time24 },
    { name: 'Map Projections', icon: Globe24 },
    { name: 'Locations', icon: Location24 },
    { name: 'About FEVer', icon: Information24 },
    { name: 'Feedback', icon: RequestQuote24 },
  ];

  const extraMenus = [
    { name: 'Colormaps', icon: ColorPalette24 },
    { name: 'Perspective', icon: View24 },
  ];

  $: menus = advancedOptions ? defaultMenus.concat(extraMenus) : defaultMenus;
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
/>
<Menu bind:openedMenu menuName="Datasets" bind:advancedOptions>
  <Datasets
    {inventory}
    {MAX_TEXTURE_SIZE}
    bind:griddedDataset
    bind:particleDataset
    bind:particlesShown
    {advancedOptions}
  />
</Menu>
<Menu bind:openedMenu menuName="Time Machine" bind:advancedOptions>
  <TimeMachine
    bind:date
    {utc}
    {fetcher}
    {griddedDataset}
    bind:particlesShown
    {advancedOptions}
  />
</Menu>
<Menu bind:openedMenu menuName="Map Projections" bind:advancedOptions>
  <MapProjections
    bind:projection
    bind:centerLongitude
    bind:centerLatitude
    bind:zoom
    {advancedOptions}
  />
</Menu>
<Menu bind:openedMenu menuName="Locations" flexbox>
  <Locations
    bind:centerLongitude
    bind:centerLatitude
    bind:zoom
    bind:pins
    {griddedData}
    {griddedUnit}
  />
</Menu>
<Menu bind:openedMenu menuName="About FEVer">
  <About
  />
</Menu>
<Menu bind:openedMenu menuName="Feedback">
  <Feedback
  />
</Menu>
{#if advancedOptions}
  <Menu bind:openedMenu menuName="Colormaps">
    <Colormaps
      bind:griddedColormap
    />
  </Menu>
  <Menu bind:openedMenu menuName="Perspective">
    <Perspective
      {minZoom}
      {maxZoom}
      bind:zoom
      {minLat}
      {maxLat}
      {minLong}
      {maxLong}
      bind:centerLatitude
      bind:centerLongitude
    />
  </Menu>
{/if}
<main>
  <Map
    {projection}
    {centerLongitude}
    {centerLatitude}
    {zoom}
    {griddedData}
    {griddedColormap}
    {griddedDomain}
    {particleData}
    {particlesShown}
    {particlesPaused}
    {particleLifetime}
    {particleCount}
    {particleDisplay}
    {vectorData}
    {vectorColors}
    bind:d3geoProjection
    bind:MAX_TEXTURE_SIZE
  >
    <div class="background" slot="background"></div>
    <Controls
      {minZoom}
      {maxZoom}
      bind:centerLongitude
      bind:centerLatitude
      bind:zoom
      {d3geoProjection}
      bind:pins
    />
    <Pins
      bind:pins
      {d3geoProjection}
      {griddedData}
      {griddedUnit}
    />
    <Loading {fetcher} />
    <Legends
      {date}
      bind:utc
      {griddedDataset}
      {particleDataset}
      {griddedColormap}
      {griddedDomain}
      bind:griddedUnit
      bind:preferredUnits
      {particlesShown}
      {particleDisplay}
      bind:particlesPaused
    />
  </Map>
</main>
</div>

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

  div.background {
    background-color: var(--primary-color-dark);
  }
</style>
