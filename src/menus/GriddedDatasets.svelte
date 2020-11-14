<script>
  import { Float16Array } from '@petamoriken/float16';

  export let griddedData;
  export let griddedDomain;
  export let fetcher;

  let datasets = [
    {
      name: 'surface temperature',
      description: 'Temperature at ground level',
      units: 'K',
      path: '/data/gfs-temperature.fp16',
      domain: [273.15 - 70, 273.15 + 70],
    },
    {
      name: 'u-wind velocity',
      description: 'Wind velocity west to east at 10m above ground level',
      units: 'm/s',
      path: '/data/gfs-u-wind.fp16',
      domain: [-35, 35],
    },
    {
      name: 'v-wind velocity',
      description: 'Wind velocity south to north at 10m above ground level',
      units: 'm/s',
      path: '/data/gfs-v-wind.fp16',
      domain: [-35, 35],
    },
    {
      name: 'wind speed',
      description: 'Wind speed at 10m above ground level',
      units: 'm/s',
      path: '/data/gfs-wind-speed.fp16',
      domain: [0, 35],
    },
  ];
  let dataset = datasets[3];
  $: dataset, updateData();

  async function updateData() {
    let path = dataset.path;
    let buffer = await fetcher.fetch(path, 'gridded');
    if (!buffer) return;

    griddedData = {
      float16Array: new Float16Array(buffer),
      width: 1440,
      height: 721,
      description: dataset.description,
      units: dataset.units,
    }
    griddedDomain = dataset.domain;
  }
</script>

<p>Choose a dataset:</p>
{#each datasets as d}
<label>
  <input
    type="radio"
    bind:group={dataset}
    value={d}
  >
  {d.name}
</label>
{/each}

<h2>Note</h2>
<p>These demo menus exist only to illustrate the process of binding
configuration variables between various menus and the map.</p>
<p>Their content and the variables they configure will change in the future.</p>

<style>
  label {
    padding: 0.25em 0;
    display: block;
  }

  label:hover {
    background-color: rgba(1, 1, 1, 0.04);
  }
</style>
