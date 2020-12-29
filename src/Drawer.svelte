<script>
  import { tips } from './tooltip.js';
  import { onMount, tick } from 'svelte';
  import List from './components/List.svelte';
  import Button from './components/Button.svelte';
  import ArrowLeft20 from "carbon-icons-svelte/lib/ArrowLeft20";
  import { createFocusTrap } from 'focus-trap';

  export let menus;
  export let openedMenu;
  export let drawerOpen;

  let drawer, scrim, focusTrap;
  onMount(() => focusTrap = createFocusTrap([drawer, scrim], {
    // we'll handle the following cases manually
    escapeDeactivates: false,
    returnFocusOnDeactivate: false,
  }));

  $: if (drawerOpen) { (async () => {
    await tick();
    focusTrap.activate();
  })() }

  function closeDrawer() {
    drawerOpen = false;
    focusTrap.deactivate();
    // focus on the button that opened the drawer when the drawer is dismissed
    // (and no other menu is opened)
    if (openedMenu === null) {
      drawer.parentNode.querySelector('div.rail button').focus();
    }
    tips.forEach(t => t.hide());
  }

  function openMenu(menu) {
    openedMenu = menu.name;
    closeDrawer();
  }

  function handleKeydown(e) {
    if (e.key === 'Escape') {
      closeDrawer();
    }
  }
</script>

<aside class:open={drawerOpen} bind:this={drawer} on:keydown={handleKeydown}>
  <header>
    <h1>Fluid Earth Viewer 2</h1>
    <p>From the FEVer Team at Byrd</p>
    <Button action={closeDrawer} full>
      <ArrowLeft20 style="margin-right: 8px" />
      Return to map
    </Button>
    <hr>
  </header>
  <List
    items={menus}
    action={openMenu}
  />
</aside>
<div class:open={drawerOpen} on:click={closeDrawer} bind:this={scrim}></div>

<style>
  aside {
    background-color: #015B5B;
    color: white;

    z-index: 10000; /* place above tooltip (z-index: 9999) when opening */
    position: absolute;

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

  header {
    padding: 1em;
  }

  div {
    z-index: 9999;
    background-color: black;
    -webkit-tap-highlight-color: transparent;
    width: 100%;
    height: 100%;
    position: absolute;

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
