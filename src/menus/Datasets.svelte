<script>
  import ChipGroup from '../components/ChipGroup.svelte';
  import Toggle from 'svelte-toggle';

  export let inventory;
  export let MAX_TEXTURE_SIZE;
  export let griddedDataset;
  export let particleDataset;
  export let particlesShown;
  export let advancedOptions;

  const categoryOptions = [
    'atmosphere',
    'oceans',
    'other',
  ];

  const atmospherePropertyOptions = [
    'temperature',
    'wind',
    'relative humidity',
    'mean sea level pressure',
  ];

  const levelOptions = [
    'near ground',
    '850 mb',
    '500 mb',
    '300 mb',
    '200 mb',
    '10 mb',
    'total column',
  ];
</script>

<h2>Filters</h2>

<h3>Category</h3>
<ChipGroup options={categoryOptions}/>

<h3>Property</h3>
<ChipGroup options={atmospherePropertyOptions}/>


<h3>Level</h3>
<ChipGroup options={levelOptions}/>

<h2>Settings</h2>

<Toggle
  bind:toggled={particlesShown}
  label="streamlines"
  toggledColor="var(--secondary-color)"
  on="particle animation enabled"
  off="particle animation disabled"
  style="order: 2; margin-left: auto"
/>

<h2>About this menu</h2>

<p>
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Eu nisl nunc mi ipsum faucibus. Molestie at elementum eu facilisis sed odio morbi quis. Arcu dictum varius duis at. Egestas dui id ornare arcu odio ut sem nulla. Placerat duis ultricies lacus sed. Eget mi proin sed libero. Aliquam id diam maecenas ultricies mi eget mauris pharetra et. Egestas sed tempus urna et pharetra. Suspendisse in est ante in nibh mauris cursus.
</p>

{#if advancedOptions}
  <h2>All Datasets</h2>

  <h3>Gridded</h3>
  {#each inventory.filter(d => d.colormap) as dataset}
    <label>
      <input
        type="radio"
        name="griddedDataset"
        bind:group={griddedDataset}
        value={dataset}
        disabled={Math.max(dataset.width, dataset.height) > MAX_TEXTURE_SIZE}
      >
      {dataset.name}
    </label>
  {/each}

  <h3>Particle</h3>
  {#each inventory.filter(d => d.particleDisplay) as dataset}
    <label>
      <input
        type="radio"
        name="particleDataset"
        bind:group={particleDataset}
        value={dataset}
        disabled={Math.max(dataset.width, dataset.height) > MAX_TEXTURE_SIZE}
      >
      {dataset.name}
    </label>
  {/each}
{/if}

<style>
  label {
    padding: 0.25em 0;
    display: block;
    cursor: pointer;
  }

  label:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }

  h3 {
    margin: 1em 0 0.25em;
    font-size: 1em;
  }
</style>
