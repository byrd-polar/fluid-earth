<script>
  import Sidebar from './Sidebar.svelte';

  import Menu from './menus/Menu.svelte';
  import MapProjections from './menus/MapProjections.svelte';
  import Colormaps from './menus/Colormaps.svelte';
  import Variables from './menus/Variables.svelte';
  import Markers from './menus/Markers.svelte';
  import Projections from './menus/Projections.svelte';
  import Advanced from './menus/Advanced.svelte';
  import ZoomSlider from './menus/ZoomSlider.svelte';
  import SiteNav from './menus/OldTopBarItems.svelte';
  import TimeSlider from './menus/TimeSlider.svelte';

  import Map from './map/Map.svelte';
  import colormaps from './map/colormaps/';
  import projections from './map/projections/';

  import Legend from './overlays/Legend.svelte';
  import Loading from './overlays/Loading.svelte';
  import Controls from './overlays/Controls.svelte';
  import Branding from './overlays/Branding.svelte';

  import Fetcher from './fetcher.js';
  import date from './date.js'

  import { onMount } from 'svelte';
  import { Float16Array } from '@petamoriken/float16';

  // don't pass this as a prop to child components; pass fetcher instead as
  // fetcher.inventory will contain parsed dates instead of raw ISO strings
  export let inventory;

  let openedMenu = null;
  let fetcher = new Fetcher(inventory);
  $: $date, (async () => {
    let uPath = `/data/gfs-0p25-u-wind-velocity-10m/${$date.toISOString()}.fp16`;
    let vPath = `/data/gfs-0p25-v-wind-velocity-10m/${$date.toISOString()}.fp16`;

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
  })();

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
    description: 'Loading...',
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

  let updateWebglSize; // to be bound from Map

  onMount(() => {
    // workaround some race condition loading bugs
    setTimeout(updateWebglSize, 0.5);

    // JS implementation of 100vh for mobile, see:
    // https://chanind.github.io/javascript/2019/09/28/avoid-100vh-on-mobile-web.html
    window.addEventListener('resize', () => {
      document.body.style.height = `${window.innerHeight}px`;
      updateWebglSize();
    });
  });
</script>

<!--
  Note: for the attributes/props in the components below, {variable} is
  shorthand for variable={variable} and bind:variable is shorthand for
  bind:variable={variable}
-->
<Sidebar bind:openedMenu/>
<Menu bind:openedMenu menuName="Map Projections"
      on:resize={updateWebglSize}>
  <MapProjections
    bind:projection
  />
</Menu>
<Menu bind:openedMenu menuName="Colormaps"
      on:resize={updateWebglSize}>
  <Colormaps
    bind:griddedColormap
  />
</Menu>
<Menu bind:openedMenu menuName="Variables" darkBackground="true"
      on:resize={updateWebglSize}>
  <Variables
    {fetcher}
    bind:griddedData
    bind:griddedDomain
    bind:griddedColormap
  />
</Menu>
  <Menu bind:openedMenu menuName="Markers" darkBackground="true"
      on:resize={updateWebglSize}>
  <Markers/>
  </Menu>
  <Menu bind:openedMenu menuName="Projections" darkBackground="true"
      on:resize={updateWebglSize}>
  <Projections/>
</Menu>
<Menu bind:openedMenu menuName="Advanced" darkBackground="true"
      on:resize={updateWebglSize}>
  <Advanced/>
</Menu>
<Menu bind:openedMenu menuName="Zoom Slider"
      on:resize={updateWebglSize}>
  <ZoomSlider
    bind:zoom
  />
  </Menu>
  <Menu bind:openedMenu menuName="Site Navigation" darkBackground="true"
      on:resize={updateWebglSize}>
  <SiteNav
  />
</Menu>
<Menu bind:openedMenu menuName="Time Range Slider" darkBackground="true"
      on:resize={updateWebglSize}>
  <TimeSlider/>
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
    bind:updateWebglSize
  >
    <Controls
      bind:center
      bind:zoom
    />
    <Loading {fetcher} />
    <Legend
      {griddedData}
      {griddedColormap}
      {griddedDomain}
      {particleDisplay}
    />
    <Branding/>
  </Map>
</main>
<aside></aside>

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

  /* Fix for SVGs not being vertically centered in icon button. Doesn't seem to
   * affect Chromium, which is probably why it was missed. Considered patching
   * it in the @material source but it is determined by a Sass mixin, so it's
   * clearer to fix it here. */
  :global(.mdc-icon-button) {
    font-size: unset;
  }

  aside {
    /* width: 500px; */
    margin-left: auto;
  }
</style>
