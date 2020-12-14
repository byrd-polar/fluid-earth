<script>
  import colormaps from '../map/colormaps/';

  export let griddedColormap;
</script>

<h2>Selector</h2>

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


<h2>About this menu</h2>

<p>Colormaps define how numerical values are converted to colors to display on
the map.</p>
<p>Perceptions of data are heavily influenced by the choice of colormap, so it
is important to select an appropriate colormap for each dataset.</p>


<style>
  label {
    padding: 0.25em 0;
    display: block;
  }

  label:hover {
    background-color: rgba(1, 1, 1, 0.04);
  }
</style>
