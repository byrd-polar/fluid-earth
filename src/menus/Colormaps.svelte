<script>
  import colormaps from '../map/colormaps/';

  export let griddedColormap;
</script>

<label>Choose a colormap:
  <select bind:value={griddedColormap} name="colormaps">
    {#each Object.values(colormaps) as colormap}
      <option value={colormap}>{colormap.name}</option>
    {/each}
  </select>
</label>

<style>
  label {
    padding-top: 1em;
    display: block;
  }

  select {
    height: 2.5em;
  }
</style>
