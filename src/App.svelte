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
  import Controls from './Controls.svelte';
  import colormaps from './map/colormaps/';
  import projections from './map/projections/';

  let openedMenu = null;

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
  async function updateParticleData() {
    let uPath = '/data/gfs-u-wind.f32';
    let vPath = '/data/gfs-v-wind.f32';
    let uBuffer = await fetch(uPath).then(res => res.arrayBuffer());
    let vBuffer = await fetch(vPath).then(res => res.arrayBuffer());
    particleData = {
      uVelocities: new Float32Array(uBuffer),
      vVelocities: new Float32Array(vBuffer),
      width: 1440,
      height: 721,
    };
  }
  updateParticleData();

  let particleDisplay = {
    size: 0.8,
    rate: 5e4,
    opacity: 0.1,
    fade: 0.96,
    enabled: true,
  };

  // JS implementation of 100vh for mobile, see:
  // https://chanind.github.io/javascript/2019/09/28/avoid-100vh-on-mobile-web.html
  window.addEventListener('resize', () => {
    document.body.style.height = `${window.innerHeight}px`;
  });
</script>

<!--
  Note: for the attributes/props in the components below, {variable} is
  shorthand for variable={variable} and bind:variable is shorthand for
  bind:variable={variable}
-->
<Sidebar bind:openedMenu/>
<Menu bind:openedMenu menuName="Map Projections">
  <MapProjections
    bind:projection
  />
</Menu>
<Menu bind:openedMenu menuName="Gridded Datasets">
  <GriddedDatasets
    bind:griddedData
    bind:griddedDomain
  />
</Menu>
<Menu bind:openedMenu menuName="Colormaps">
  <Colormaps
    bind:griddedColormap
  />
</Menu>
<Menu bind:openedMenu menuName="Map Options" darkBackground="true">
  <MapOptions/>
</Menu>
<Menu bind:openedMenu menuName="Zoom Slider">
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
  >
    <Legend
      {griddedData}
      {griddedColormap}
      {griddedDomain}
      {particleDisplay}
    />
    <Controls
      bind:center
      bind:zoom
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
