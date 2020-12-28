<script>
  export let items;
  export let action;
</script>

{#each items as item}
  <button on:click={() => action(item.name)}>
    <svelte:component this={item.icon}/>
    {item.name}
  </button>
{/each}

<style>
  button {
    display: block;
    width: 100%;
  }
</style>
