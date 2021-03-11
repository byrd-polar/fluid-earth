<script>
  import Toggle from 'svelte-toggle';

  export let inventory;
  export let id;
  export let griddedDataset;
  export let particleDataset;
  export let particlesShown;
</script>

<h2>Gridded Datasets</h2>
{#each inventory.filter(d => d.colormap) as dataset}
  <label>
    <input
      type="radio"
      name={`griddedDataset-${id}`}
      bind:group={griddedDataset}
      value={dataset}
    >
    {dataset.name}
  </label>
{/each}

<h2>Particle Datasets</h2>
{#each inventory.filter(d => d.particleDisplay) as dataset}
  <label>
    <input
      type="radio"
      name={`particleDataset-${id}`}
      bind:group={particleDataset}
      value={dataset}
    >
    {dataset.name}
  </label>
{/each}

<h2>Settings</h2>

<Toggle
  bind:toggled={particlesShown}
  label="streamlines"
  toggledColor="var(--secondary-color)"
  on="particle animation enabled"
  off="particle animation disabled"
  style="order: 2; margin-left: auto"
/>

<style>
  label {
    padding: 0.25em 0;
    display: block;
    cursor: pointer;
  }

  label:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
</style>
