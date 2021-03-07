<script>
  export let inventory;
  export let griddedDataset;
  export let particleDataset;
</script>

<h2>Gridded Datasets</h2>
<form>
  {#each inventory.filter(d => d.colormap) as dataset}
    <label>
      <input
        type="radio"
        bind:group={griddedDataset}
        value={dataset}
      >
      {dataset.name}
    </label>
  {/each}
</form>

<h2>Particle Datasets</h2>
<form>
  {#each inventory.filter(d => d.particleDisplay) as dataset}
    <label>
      <input
        type="radio"
        bind:group={particleDataset}
        value={dataset}
      >
      {dataset.name}
    </label>
  {/each}
</form>

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
