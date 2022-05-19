<script>
  export let items;
  export let action;
</script>

{#each items as item}
  <button on:click={() => action(item)}>
    <svelte:component this={item.icon} size={24} />
    <span>{item.name}</span>
  </button>
{/each}

<style>
  button {
    all: unset;
    box-sizing: border-box;
    display: block;
    width: 100%;
    color: white;
    cursor: pointer;

    height: 56px;
    display: flex;
    align-items: center;

    transition: background-color 0.25s ease 0s;
  }

  button:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }

  button:focus {
    background-color: rgba(255, 255, 255, 0.15);
  }

  button :global(svg) {
    margin: 0 16px;
    flex-shrink: 0;
  }

  span {
    margin-right: 16px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
</style>
