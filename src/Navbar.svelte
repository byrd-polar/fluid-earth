<script>
  import IconButton from './components/IconButton.svelte';
  import Menu from 'carbon-icons-svelte/lib/Menu.svelte';
  import { tick } from 'svelte';
  import { mobile } from './stores.js';

  export let menus;
  export let openedMenu;
  export let drawerOpen;

  function openDrawer() {
    openedMenu = null;
    drawerOpen = true;
  }

  function toggleMenu(menu) {
    if (openedMenu === menu) {
      openedMenu = null;
    } else {
      openedMenu = menu;
    }
  }

  let rail;
  // focus on the first button of the just-opened menu
  $: if (openedMenu !== null) { (async () => {
    await tick();
    rail.parentNode.querySelector('aside.open button').focus();
  })() }
</script>

<div class="rail" bind:this={rail}>
<nav>
  <IconButton
    name="Menus and Links"
    action={openDrawer}
  >
    <Menu size={24} />
  </IconButton>
  {#if !$mobile}
    {#each menus as menu}
      <IconButton
        name={menu.name}
        action={() => toggleMenu(menu.name)}
        selected={openedMenu === menu.name}
      >
        <svelte:component this={menu.icon} size={24} />
      </IconButton>
    {/each}
  {/if}
</nav>
</div>

<style>
  div.rail {
    z-index: 2;
    background: var(--secondary-color-dark);
    overflow: hidden auto;
    scrollbar-color: grey transparent;
    box-shadow:
      2px 0 1px -1px rgba(0,0,0,.2),
      1px 0 1px  0   rgba(0,0,0,.14),
      1px 0 3px  0   rgba(0,0,0,.12);
  }

  nav {
    display: flex;
    flex-direction: column;
    padding: 8px;
  }

  nav :global(button) {
    margin: 12px 0;
  }

  @media (max-width: 576px) {
    div.rail {
      background: transparent;
      position: absolute;
      box-shadow: none;
    }

    nav {
      flex-direction: row;
      width: min-content;
    }

    nav :global(button) {
      margin: 0;
      /* multiple shadows used to increase intensity */
      filter:
        drop-shadow(0 0 2px black)
        drop-shadow(0 0 4px rgba(0, 0, 0, 0.5));
    }
  }
</style>
