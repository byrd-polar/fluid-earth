<script>
  import Sidebar from './Sidebar.svelte';
  import Menu from './menus/Menu.svelte';
  import MapProjections from './menus/MapProjections.svelte';
  import GriddedDatasets from './menus/GriddedDatasets.svelte';
  import Colormaps from './menus/Colormaps.svelte';
  import MapOptions from './menus/MapOptions.svelte';
  import ZoomSlider from './menus/ZoomSlider.svelte';

  import Map from './map/Map.svelte';
  import Legend from './Legend.svelte';
  import Loading from './fetcher/Loading.svelte';
  import Fetcher from './fetcher/fetcher.js';
  import Controls from './Controls.svelte';
  import colormaps from './map/colormaps/';
  import projections from './map/projections/';

  import { onMount } from 'svelte';

  // don't pass this as a prop to child components; pass fetcher instead as
  // fetcher.inventory will contain parsed dates instead of raw ISO strings
  export let inventory;

  let openedMenu = null;
  let fetcher = new Fetcher(inventory);
  let date = new Date('2020-08-08T18:00:00.000Z');
  $: date, (async () => {
    let uPath = `/data/gfs-0p25-u-wind-velocity-10m/${date.toISOString()}.fp16`;
    let vPath = `/data/gfs-0p25-v-wind-velocity-10m/${date.toISOString()}.fp16`;

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
  let griddedData;
  let griddedColormap = colormaps.VIRIDIS;
  let griddedDomain;

  let particleData;
  let vectorData;
  (async () => {
    vectorData = await fetcher.fetch('/data/topology.json', 'vector');
  })();

  let particleLifetime = 1000;
  let particleCount = 1e5;
  let particleDisplay = {
    size: 0.8,
    rate: 5e4,
    opacity: 0.1,
    fade: 0.96,
    enabled: true,
  };

  let updateWebglSize = () => {}; // to be bound from Map
  // workaround some race condition loading bugs
  onMount(() => setTimeout(updateWebglSize, 0.5));

  // JS implementation of 100vh for mobile, see:
  // https://chanind.github.io/javascript/2019/09/28/avoid-100vh-on-mobile-web.html
  window.addEventListener('resize', () => {
    document.body.style.height = `${window.innerHeight}px`;
    updateWebglSize();
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
<Menu bind:openedMenu menuName="Gridded Datasets"
      on:resize={updateWebglSize}>
  <GriddedDatasets
    {fetcher}
    bind:date
    bind:griddedData
    bind:griddedDomain
    bind:griddedColormap
  />
</Menu>
<Menu bind:openedMenu menuName="Colormaps"
      on:resize={updateWebglSize}>
  <Colormaps
    bind:griddedColormap
  />
</Menu>
<Menu bind:openedMenu menuName="Map Options" darkBackground="true"
      on:resize={updateWebglSize}>
  <MapOptions/>
</Menu>
<Menu bind:openedMenu menuName="Zoom Slider"
      on:resize={updateWebglSize}>
  <ZoomSlider
    bind:zoom
  />
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
      {date}
      {griddedData}
      {griddedColormap}
      {griddedDomain}
      {particleDisplay}
    />
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
