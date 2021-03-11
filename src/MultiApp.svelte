<script>
  import App from './App.svelte';

  export let inventory;
  export let count = 2;

  let centerLongitude;
  let centerLatitude;
  let zoom;
  let pins;
</script>

{#each {length: count} as _, id}
  <App
    bind:centerLongitude
    bind:centerLatitude
    bind:zoom
    bind:pins
    {inventory}
    {id}
  />
{/each}
