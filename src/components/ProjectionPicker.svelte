<script>
  import projections from '../map/projections/';
  import { uniqueId } from '../utility.js';

  export let projection;

  const name = uniqueId();
  const projs = Object.values(projections);
  const props = [...new Set(projs.map(p => p.distortionProperty))];
</script>

{#each props as prop}
  <h3>{prop}</h3>
  {#each projs.filter(p => p.distortionProperty === prop) as proj}
    <label>
      <input
        type="radio"
        {name}
        bind:group={projection}
        value={proj}
      >
      {proj.name}
    </label>
  {/each}
{/each}


<style>
  h3 {
    margin: 1em 0 0.25em;
    font-size: 1em;
  }

  label {
    display: block;
    border: thin solid rgba(255, 255, 255, 0.3);
    border-radius: 0.5em;
    background-color: rgba(29, 29, 29, 0.75);
    padding: 0.5em;
    margin-bottom: 0.5em;
    cursor: pointer;
  }

  label:focus-within, label:hover {
    filter: brightness(125%);
  }

  input {
    accent-color: var(--primary-color-light);
  }
</style>
