<script>
  import colormaps from '../map/colormaps/';

  export let griddedColormap;
</script>

<p>Choose a colormap:</p>
{#each Object.values(colormaps) as c}
<label>
  <input
    type="radio"
    bind:group={griddedColormap}
    value={c}
  >
  {c.name}
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
