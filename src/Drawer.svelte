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

    // focus on the button that opened the drawer when the drawer is dismissed
    // (and no other menu is opened)
    document.querySelector('div.rail button').focus();
    tips.forEach(t => t.hide());
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
    background-color: #015B5B;
    color: white;

    z-index: 10000; /* place above tooltip (z-index: 9999) when opening */
    position: absolute;

    padding: 1em;
    height: 100%;
    width: 256px;

    margin-left: -256px;
    visibility: hidden;
    transition:
      margin-left 0.25s ease 0s,
      visibility 0s linear 0.25s;
  }

  aside.open {
    margin-left: 0;
    visibility: visible;
    transition:
      margin-left 0.25s ease 0s,
      visibility 0s linear 0s;
  }

  button {
    width: 100%;
  }

  div {
    z-index: 9999;
    background-color: black;
    width: 100%;
    height: 100%;
    position: fixed;

    cursor: auto;
    opacity: 0;
    visibility: hidden;
    transition:
      opacity 0.25s ease 0s,
      cursor 0s linear 0.25s,
      visibility 0s linear 0.25s;
  }

  div.open {
    cursor: pointer;
    opacity: 0.5;
    visibility: visible;
    transition:
      opacity 0.25s ease 0s,
      cursor 0s linear 0s,
      visibility 0s linear 0s;
  }
</style>
