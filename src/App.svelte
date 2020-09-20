<script>
  import Sidebar from './Sidebar.svelte';
  import Menu from './menus/Menu.svelte';
  import Demo from './menus/Demo.svelte';

  import Map from './map/Map.svelte';
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

  // JS implementation of 100vh for mobile, see:
  // https://chanind.github.io/javascript/2019/09/28/avoid-100vh-on-mobile-web.html
  window.addEventListener('resize', () => {
    document.body.style.height = `${window.innerHeight}px`;
  });
</script>

<Sidebar bind:openedMenu/>
<Menu bind:openedMenu menuName="Demo">
  <Demo
    bind:projection
    bind:griddedData
    bind:griddedColormap
    bind:griddedDomain
  />
</Menu>
<main>
  <div class="layers">
    <Map
      {projection}
      {center}
      {zoom}
      {griddedData}
      {griddedColormap}
      {griddedDomain}
      {particleData}
    />
    <Controls
      bind:center
      bind:zoom
    />
  </div>
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

  div.layers {
    position: relative;
    flex: 1;
  }

  :global(div.layers > *) {
    width: 100%;
    height: 100%;
    position: absolute;
  }

  aside {
    /* width: 500px; */
    margin-left: auto;
  }
</style>
