<script>
  import Menu from './Menu.svelte';
  import colormaps from '../map/colormaps/';
  import projections from '../map/projections/';

  export let opened;
  export let projection;
  export let griddedData;
  export let griddedColormap;
  export let griddedDomain;

  let datasets = [
    {
      name: 'surface temperature',
      path: '/data/gfs-temperature.f32',
      domain: [273.15 - 70, 273.15 + 50],
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
</script>

<Menu {opened}>
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
</Menu>

<style>
  label {
    padding-top: 1em;
    padding-left: 1em;
    display: block;
  }

  select {
    height: 2.5em;
  }
</style>
