<script>
  import Navbar from './Navbar.svelte';
  import Drawer from './Drawer.svelte';
  import Menu from './Menu.svelte';

  import MapProjections from './menus/MapProjections.svelte';
  import Colormaps from './menus/Colormaps.svelte';
  import Variables from './menus/Variables.svelte';
  import Markers from './menus/Markers.svelte';
  import Projections from './menus/Projections.svelte';
  import Advanced from './menus/Advanced.svelte';
  import ZoomSlider from './menus/ZoomSlider.svelte';
  import SiteNav from './menus/OldTopBarItems.svelte';
  import TimeSlider from './menus/TimeSlider.svelte';

  import Map, { updateAllWebglSizes } from './map/Map.svelte';
  import colormaps from './map/colormaps/';
  import projections from './map/projections/';

  import Legend from './overlays/Legend.svelte';
  import Loading from './overlays/Loading.svelte';
  import Controls from './overlays/Controls.svelte';
  import Branding from './overlays/Branding.svelte';

  import Fetcher from './fetcher.js';

  import { onMount } from 'svelte';
  import { Float16Array } from '@petamoriken/float16';

  export let inventory;

  let openedMenu = null;
  let drawerOpen = false;

  const fetcher = new Fetcher(inventory);
  let date = new Date('2020-08-08T18:00:00.000Z');
  let dataset = '/data/gfs-0p25-wind-speed-10m/';

  // see comment in onMount
  let updateGriddedData = () => {};
  let updateParticleData = () => {};

  let projection = projections.VERTICAL_PERSPECTIVE;
  let center = {
    longitude: 0,
    latitude: 0,
  };
  let zoom = 1;
  let griddedData = {
    floatArray: new Float16Array([0]),
    width: 1,
    height: 1,
  };
  let griddedColormap = colormaps.VIRIDIS;
  let griddedDomain = [0, 0];

  let particleData = {
    uVelocities: new Float16Array([0]),
    vVelocities: new Float16Array([0]),
    width: 1,
    height: 1,
  };
  let vectorData = { objects: {} };
  (async () => {
    vectorData = await fetcher.fetch('/data/topology.json', 'vector');
  })();

  let particleLifetime = 1000;
  let particleCount = 1e5;
  let particleDisplay = {
    size: 0.8,
    rate: 5e4,
    opacity: 0.4,
    fade: 0.96,
    enabled: true,
  };

  onMount(() => {
    // workaround some race condition loading bugs
    setTimeout(updateAllWebglSizes, 0.5);

    // JS implementation of 100vh for mobile, see:
    // https://chanind.github.io/javascript/2019/09/28/avoid-100vh-on-mobile-web.html
    window.addEventListener('resize', () => {
      document.body.style.height = `${window.innerHeight}px`;
      updateAllWebglSizes();
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
      griddedDomain = datasetInfo.domain;
      griddedColormap = datasetInfo.colormap;
    };
    updateParticleData = async () => {
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
  $: date, updateParticleData();

  // Find new icons from: https://ibm.github.io/carbon-icons-svelte/
  //
  // Not using { Icon } import syntax for significantly faster build times, see
  // https://github.com/IBM/carbon-icons-svelte#direct-import-recommended
  import Globe32 from "carbon-icons-svelte/lib/Globe32";
  import ColorPalette32 from "carbon-icons-svelte/lib/ColorPalette32";
  import List24 from "carbon-icons-svelte/lib/List24";
  import Location24 from "carbon-icons-svelte/lib/Location24";
  import Earth24 from "carbon-icons-svelte/lib/Earth24";
  import SettingsAdjust24 from "carbon-icons-svelte/lib/SettingsAdjust24";
  import WatsonHealthFusionBlender32 from
    "carbon-icons-svelte/lib/WatsonHealthFusionBlender32";
  import Time32 from "carbon-icons-svelte/lib/Time32";
  import Information32 from "carbon-icons-svelte/lib/Information32";

  const menus = [
    { name: 'Map Projections', icon: Globe32 },
    { name: 'Colormaps', icon: ColorPalette32 },
    { name: 'Variables', icon: List24 },
    { name: 'Markers', icon: Location24 },
    { name: 'Projections', icon: Earth24 },
    { name: 'Advanced', icon: SettingsAdjust24 },
    { name: 'Zoom Slider', icon: WatsonHealthFusionBlender32 },
    { name: 'Time Range Slider', icon: Time32 },
    { name: 'Site Navigation', icon: Information32 },
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
<Menu bind:openedMenu menuName="Variables">
  <Variables
    {inventory}
    bind:date
    bind:dataset
  />
</Menu>
<Menu bind:openedMenu menuName="Markers">
  <Markers/>
</Menu>
<Menu bind:openedMenu menuName="Projections">
  <Projections/>
</Menu>
<Menu bind:openedMenu menuName="Advanced">
  <Advanced/>
</Menu>
<Menu bind:openedMenu menuName="Zoom Slider">
  <ZoomSlider
    bind:zoom
  />
</Menu>
<Menu bind:openedMenu menuName="Site Navigation">
  <SiteNav
  />
</Menu>
<Menu bind:openedMenu menuName="Time Range Slider">
</Menu>
<main>
  <Map
    {projection}
    {center}
    {zoom}
    {griddedData}
    {griddedColormap}
    {griddedDomain}
    {particleData}
    {particleLifetime}
    {particleCount}
    {particleDisplay}
    {vectorData}
  >
    <Controls
      bind:center
      bind:zoom
    />
    <Loading {fetcher} />
    <Legend
      {date}
      datasetInfo={inventory[dataset]}
      {griddedColormap}
      {griddedDomain}
      {particleDisplay}
    />
    <Branding/>
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
</style>
