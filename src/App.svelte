<script>
  import Navbar from './Navbar.svelte';
  import Drawer from './Drawer.svelte';
  import Menu from './Menu.svelte';

  import MapProjections from './menus/MapProjections.svelte';
  import Colormaps from './menus/Colormaps.svelte';
  import Variables from './menus/Variables.svelte';
  import Projections from './menus/Projections.svelte';
  import Perspective from './menus/Perspective.svelte';
  import TimeMachine from './menus/TimeMachine.svelte';
  import Feedback from './menus/Feedback.svelte';

  import Map, { updateAllWebglResolutions } from './map/Map.svelte';
  import colormaps from './map/colormaps/';
  import projections from './map/projections/';

  import Pins from './overlays/Pins.svelte';
  import Legend from './overlays/Legend.svelte';
  import Loading from './overlays/Loading.svelte';
  import Controls from './overlays/Controls.svelte';

  import Fetcher from './fetcher.js';

  import { onMount } from 'svelte';
  import { Float16Array } from '@petamoriken/float16';

  export let inventory;

  const minZoom = 0.5;
  const maxZoom = 15;

  const minLat = -90;
  const maxLat = 90;
  const minLong = -360;
  const maxLong = 360;

  let openedMenu = null;
  let drawerOpen = false;

  const fetcher = new Fetcher(inventory);
  let date = new Date('2020-08-08T18:00:00.000Z');
  let dataset = '/data/gfs-0p25-wind-speed-10m/';
  let previousDataset = null;

  // see comment in onMount
  let updateGriddedData = () => {};
  let updateParticleData = () => {};

  let projection = projections.VERTICAL_PERSPECTIVE;
  let d3geoProjection = projection.function;
  let centerLongitude = 0;
  let centerLatitude = 0;
  let zoom = 1;

  let griddedData = {
    floatArray: new Float16Array([0]),
    width: 1,
    height: 1,
  };
  let griddedColormap = colormaps.VIRIDIS;
  let griddedDomain = [0, 0];

  const emptyParticleData = {
    uVelocities: new Float16Array([0]),
    vVelocities: new Float16Array([0]),
    width: 1,
    height: 1,
  };
  let particleData = emptyParticleData;

  let vectorData = { objects: {} };
  (async () => {
    vectorData = await fetcher.fetch('/data/topology.json', 'vector');
  })();

  let particlesShown = true;
  $: if (!particlesShown) {
    particleData = emptyParticleData;
  }
  let particleLifetime = 1000;
  let particleCount = 1e5;
  let particleDisplay = {
    size: 0.8,
    rate: 5e4,
    opacity: 0.4,
    fade: 0.96,
  };

  let pins = new Set();

  onMount(() => {
    // workaround some race condition loading bugs
    setTimeout(updateAllWebglResolutions, 0.5);

    // JS implementation of 100vh for mobile, see:
    // https://chanind.github.io/javascript/2019/09/28/avoid-100vh-on-mobile-web.html
    window.addEventListener('resize', () => {
      document.body.style.height = `${window.innerHeight}px`;
      updateAllWebglResolutions();
    });

    // Methods for updating gridded and particle data in response to
    // date or dataset changes. Defined here so that they aren't triggered
    // multiple times during the initial mount due a Svelte bug with bindings.
    updateGriddedData = async () => {
      let path = dataset + date.toISOString() + '.fp16';
      let array = await fetcher.fetch(path, 'gridded');
      if (!array) return;

      let datasetInfo = inventory[dataset];

      griddedData = {
        floatArray: array,
        width: 1440,
        height: 721,
      }

      if (previousDataset !== dataset) {
        griddedDomain = datasetInfo.domain;
        griddedColormap = datasetInfo.colormap;

        previousDataset = dataset;
      }
    };
    updateParticleData = async () => {
      if (!particlesShown) return;

      let datestr = date.toISOString();
      let uPath = `/data/gfs-0p25-u-wind-velocity-10m/${datestr}.fp16`;
      let vPath = `/data/gfs-0p25-v-wind-velocity-10m/${datestr}.fp16`;

      let uArray = fetcher.fetch(uPath, 'particle');
      let vArray = await fetcher.fetch(vPath, 'particle', false);
      uArray = await uArray;

      if (!uArray || !vArray) return;

      particleData = {
        uVelocities: uArray,
        vVelocities: vArray,
        width: 1440,
        height: 721,
      };
    };
  });

  $: date, dataset, updateGriddedData();
  $: date, particlesShown, updateParticleData();

  // Find new icons from: https://ibm.github.io/carbon-icons-svelte/
  //
  // Not using { Icon } import syntax for significantly faster build times, see
  // https://github.com/IBM/carbon-icons-svelte#direct-import-recommended
  import Grid24 from "carbon-icons-svelte/lib/Grid24";
  import Time24 from "carbon-icons-svelte/lib/Time24";
  import ColorPalette24 from "carbon-icons-svelte/lib/ColorPalette24";
  import Globe24 from "carbon-icons-svelte/lib/Globe24";
  import View24 from "carbon-icons-svelte/lib/View24";
  import Earth24 from "carbon-icons-svelte/lib/Earth24";
  import RequestQuote24 from "carbon-icons-svelte/lib/RequestQuote24";

  const menus = [
    { name: 'Datasets', icon: Grid24 },
    { name: 'Time Machine', icon: Time24 },
    { name: 'Colormaps', icon: ColorPalette24 },
    { name: 'Map Projections', icon: Globe24 },
    { name: 'Perspective', icon: View24 },
    { name: 'Projections', icon: Earth24 },
    { name: 'Feedback', icon: RequestQuote24 },
  ];
</script>

<!--
  Note: for the attributes/props in the components below, {variable} is
  shorthand for variable={variable} and bind:variable is shorthand for
  bind:variable={variable}
-->
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
<Menu bind:openedMenu menuName="Map Projections">
  <MapProjections
    bind:projection
  />
</Menu>
<Menu bind:openedMenu menuName="Colormaps">
  <Colormaps
    bind:griddedColormap
  />
</Menu>
<Menu bind:openedMenu menuName="Datasets">
  <Variables
    bind:dataset
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
<Menu bind:openedMenu menuName="Time Machine">
  <TimeMachine
    {fetcher}
    {inventory}
    bind:date
    {dataset}
    bind:particlesShown
  />
</Menu>
<Menu bind:openedMenu menuName="Feedback">
  <Feedback
  />
</Menu>
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
    {particleLifetime}
    {particleCount}
    {particleDisplay}
    {vectorData}
    bind:d3geoProjection
  >
    <div slot="background"></div>
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
      {pins}
      {d3geoProjection}
      {griddedData}
      datasetInfo={inventory[dataset]}
    />
    <Loading {fetcher} />
    <Legend
      {date}
      datasetInfo={inventory[dataset]}
      {griddedColormap}
      {griddedDomain}
      {particleDisplay}
    />
  </Map>
</main>

<style>
  :global(body) {
    display: flex;
    flex-direction: row;
    position: relative;
  }

  main {
    flex: 1;
    display: flex;
    flex-direction: row;
  }

  @media (orientation: portrait) {
    main {
      flex-direction: column;
    }
  }

  div {
    background-image: url("/images/starfield.png");
    background-position: center;
    background-size: auto 100%;
  }
</style>
