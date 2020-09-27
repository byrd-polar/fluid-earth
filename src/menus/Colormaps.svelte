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
