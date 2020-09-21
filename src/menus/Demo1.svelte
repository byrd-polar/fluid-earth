<script>
  import projections from '../map/projections/';

  export let projection;
</script>

<label>Choose a map projection:
  <select bind:value={projection} name="projections">
    {#each Object.values(projections) as projection}
      <option value={projection}>{projection.name}</option>
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
