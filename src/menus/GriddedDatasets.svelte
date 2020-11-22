<script>
  import colormaps from '../map/colormaps/';

  export let griddedData;
  export let griddedDomain;
  export let griddedColormap;
  export let fetcher;
  export let date;

  let datasets = [
    {
      name: 'surface temperature',
      description: 'Temperature at ground level',
      units: 'K',
      path: '/data/gfs-0p25-temperature-surface/',
      domain: [273.15 - 70, 273.15 + 70],
      colormap: colormaps.MAGMA,
    },
    {
      name: 'u-wind velocity',
      description: 'Wind velocity west to east at 10m above ground level',
      units: 'm/s',
      path: '/data/gfs-0p25-u-wind-velocity-10m/',
      domain: [-35, 35],
      colormap: colormaps.BR_BG,
    },
    {
      name: 'v-wind velocity',
      description: 'Wind velocity south to north at 10m above ground level',
      units: 'm/s',
      path: '/data/gfs-0p25-v-wind-velocity-10m/',
      domain: [-35, 35],
      colormap: colormaps.PR_GN,
    },
    {
      name: 'wind speed',
      description: 'Wind speed at 10m above ground level',
      units: 'm/s',
      path: '/data/gfs-0p25-wind-speed-10m/',
      domain: [0, 35],
      colormap: colormaps.VIRIDIS,
    },
  ];
  let dataset = datasets[3];
  $: date, dataset, updateData();

  let canForward, canBack, interval;
  // should get these from inventory, temporary hardcode for now
  $: canForward = date < fetcher.inventory[dataset.path].end;
  $: canBack = date > fetcher.inventory[dataset.path].start;
  $: interval = fetcher.inventory[dataset.path].intervalInHours;

  async function updateData() {
    let path = dataset.path + date.toISOString() + '.fp16';
    let array = await fetcher.fetch(path, 'gridded');
    if (!array) return;

    griddedData = {
      floatArray: array,
      width: 1440,
      height: 721,
      description: dataset.description,
      units: dataset.units,
    }
    griddedDomain = dataset.domain;
    griddedColormap = dataset.colormap;
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

<p>Step through time:</p>
<button
  disabled={!canBack}
  on:click={() => { date.setHours(date.getHours() - interval); date = date }}
>
  Back {interval} hours
</button>
<button
  disabled={!canForward}
  on:click={() => { date.setHours(date.getHours() + interval); date = date }}
>
  Forward {interval} hours
</button>

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
