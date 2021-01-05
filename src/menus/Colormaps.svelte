<script>
  import colormaps, { types } from '../map/colormaps/';

  export let griddedColormap;
</script>


<h2>About this menu</h2>

<p>
Colormaps define how numerical values are converted to colors to display on the
map.
</p>
<p>
Perceptions of data are heavily influenced by the choice of colormap, so it is
important for science communicators to select an appropriate colormap for their
data. Toggle between the colormaps below to see how the same data looks when
presented with different colors.
</p>

{#each [...types] as type}
  <h2>{type}</h2>

  {#each Object.values(colormaps).filter(map => map.type === type) as map}
    <label>
      <input
        type="radio"
        bind:group={griddedColormap}
        value={map}
      >
      {map.name}
    </label>
  {/each}
{/each}


<style>
  label {
    padding: 0.25em 0;
    display: block;
  }

  label:hover {
    background-color: rgba(1, 1, 1, 0.04);
  }
</style>
