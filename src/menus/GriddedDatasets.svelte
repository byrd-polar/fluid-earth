<script>
  export let griddedData;
  export let griddedDomain;

  let datasets = [
    {
      name: 'surface temperature',
      path: '/data/gfs-temperature.f32',
      domain: [273.15 - 70, 273.15 + 70],
    },
    {
      name: 'u-wind velocity',
      path: '/data/gfs-u-wind.f32',
      domain: [-35, 35],
    },
    {
      name: 'v-wind velocity',
      path: '/data/gfs-v-wind.f32',
      domain: [-35, 35],
    },
    {
      name: 'wind speed',
      path: '/data/gfs-wind-speed.f32',
      domain: [0, 35],
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

<label>Choose a dataset:
  <select bind:value={dataset} name="colormaps">
    {#each datasets as dataset}
      <option value={dataset}>{dataset.name}</option>
    {/each}
  </select>
</label>
<h2>Note</h2>
<p>These demo menus exist only to illustrate the process of binding
configuration variables between various menus and the map.</p>
<p>Their content and the variables they configure will change in the future.</p>

<style>
  label {
    padding-top: 1em;
    display: block;
  }

  select {
    height: 2.5em;
  }
</style>
