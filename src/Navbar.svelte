<script>
  import IconButton from './components/IconButton.svelte';
  import Menu24 from "carbon-icons-svelte/lib/Menu24";
  import { tick } from 'svelte';

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
    name="Menus"
    action={openDrawer}
  >
    <Menu24 />
  </IconButton>
  {#each menus as menu}
    <IconButton
      name={menu.name}
      action={() => toggleMenu(menu.name)}
      selected={openedMenu === menu.name}
    >
      <svelte:component this={menu.icon}/>
    </IconButton>
  {/each}
</nav>
</div>

<style>
  div.rail {
    z-index: 2;
    background: #202124;
    overflow: auto;
    box-shadow:
      2px 0 1px -1px rgba(0,0,0,.2),
      1px 0 1px  0   rgba(0,0,0,.14),
      1px 0 3px  0   rgba(0,0,0,.12);
  }

  nav {
    display: flex;
    flex-direction: column;
    padding: 0.5em;
  }

  nav :global(button) {
    margin: 0.75em 0;
  }

  @media (max-width: 36rem) {
    div.rail {
      background: transparent;
      position: absolute;
      width: 100%;
      box-shadow: none;
    }

    nav {
      flex-direction: row;
      width: min-content;
    }

    nav :global(button) {
      margin: 0 0.5em;
      /* multiple shadows used to increase intensity */
      filter:
        drop-shadow(0 0 0.125em black)
        drop-shadow(0 0 0.25em rgba(0, 0, 0, 0.5));
    }
  }
</style>
