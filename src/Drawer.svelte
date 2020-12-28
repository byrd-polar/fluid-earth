<script>
  import { tips } from './tooltip.js';
  import { onMount } from 'svelte';
  import List from './components/List.svelte';
  import ArrowLeft24 from "carbon-icons-svelte/lib/ArrowLeft24";

  export let menus;
  export let openedMenu;
  export let drawerOpen;

  function openMenu(menu) {
    closeDrawer();
    openedMenu = menu;
  }

  function closeDrawer() {
    drawerOpen = false;
  }
</script>

<aside class:open={drawerOpen}>
  <h1>Fluid Earth Viewer 2</h1>
  <p>From the FEVer Team at Byrd</p>
  <button on:click={closeDrawer}>
    <ArrowLeft24 />
    Return to map
  </button>
  <List
    items={menus}
    action={openMenu}
  />
</aside>
<div class:open={drawerOpen} on:click={closeDrawer}></div>

<style>
  aside {
    z-index: 10000; /* place above tooltip (z-index: 9999) when opening */
    background-color: #015B5B;
    color: white;
    position: absolute;
    height: 100%;
    padding: 1em;

    visibility: hidden;
    width: 256px;
    margin-left: -256px;
  }

  aside.open {
    margin-left: 0;
    visibility: visible;
  }

  button {
    width: 100%;
  }

  div {
    z-index: 9999;
    background-color: rgba(0, 0, 0, 0);
    width: 100%;
    height: 100%;
    position: fixed;
    visibility: hidden;
    cursor: pointer;
  }

  div.open {
    visibility: visible;
    background-color: rgba(0, 0, 0, 0.5);
  }
</style>
