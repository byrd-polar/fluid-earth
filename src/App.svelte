<script>
  import Map from './map/Map.svelte';
  import Controls from './Controls.svelte';
  import colormaps from './map/colormaps/';
  import projections from './map/projections/';

  let projection = projections.ORTHOGRAPHIC;
  let center = {
    longitude: 0,
    latitude: 0,
  };
  let zoom = 1;
  let griddedData;
  let griddedColormap = colormaps.VIRIDIS;
  let griddedDomain;

  let datasets = [
    {
      name: 'surface temperature',
      path: '/data/gfs-temperature.f32',
      domain: [273.15 - 70, 273.15 + 70],
    },
    {
      name: 'u-wind velocity',
      path: '/data/gfs-u-wind.f32',
      domain: [-30, 30],
    },
    {
      name: 'v-wind velocity',
      path: '/data/gfs-v-wind.f32',
      domain: [-30, 30],
    },
  ];
  let dataset = datasets[0];
  $: dataset, updateData();

  async function updateData() {
    let path = dataset.path;
    let buffer = await fetch(path).then(res => res.arrayBuffer());
    griddedData = {
      float32Array: new Float32Array(buffer),
      width: 1440,
      height: 721,
    }
    griddedDomain = dataset.domain;
  }

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
</script>

<nav></nav>
<main>
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
  <div>
    <label>Choose a map projection:
      <select bind:value={projection} name="projections">
        {#each Object.values(projections) as projection}
          <option value={projection}>{projection.name}</option>
        {/each}
      </select>
    </label>
    <label>Choose a dataset:
      <select bind:value={dataset} name="colormaps">
        {#each datasets as dataset}
          <option value={dataset}>{dataset.name}</option>
        {/each}
      </select>
    </label>
    <label>Choose a colormap:
      <select bind:value={griddedColormap} name="colormaps">
        {#each Object.values(colormaps) as colormap}
          <option value={colormap}>{colormap.name}</option>
        {/each}
      </select>
    </label>
  </div>
</main>
<aside></aside>

<style>
  :global(body) {
    display: flex;
    flex-direction: row;
  }

  nav {
    /* width: 500px; */
  }

  main {
    position: relative;
    flex: 1;
  }

  :global(main > *) {
    width: 100%;
    height: 100%;
    position: absolute;
  }

  aside {
    /* width: 500px; */
    margin-left: auto;
  }

  div {
    pointer-events: none;
  }

  div * {
    pointer-events: auto;
  }

  label {
    padding-top: 1em;
    padding-left: 1em;
    display: block;
    color: white;
  }

  select {
    height: 2.5em;
  }
</style>
