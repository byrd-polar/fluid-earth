<script>
  import tooltip from './tooltip.js';
  import IconButton from '@smui/icon-button';
  import Menu32 from "carbon-icons-svelte/lib/Menu32";

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
</script>

<div class="rail-overflow-wrapper">
<nav id="rail">
  <IconButton
    class="rail-btn"
    aria-label="Menus"
    on:click={openDrawer}
    use={[[tooltip, {content: 'Menus'}]]}
  >
    <Menu32 />
  </IconButton>
  {#each menus as menu}
    <IconButton
      class="rail-btn"
      aria-label={menu.name}
      data-selected={openedMenu === menu.name}
      on:click={() => toggleMenu(menu.name)}
      use={[[tooltip, {content: menu.name}]]}
    >
      <svelte:component this={menu.icon}/>
    </IconButton>
  {/each}
</nav>
</div>

<style>
  div.rail-overflow-wrapper {
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

  :global(nav .mdc-icon-button::before, nav .mdc-icon-button::after) {
    background-color: white /* use light ripple color */
  }

  :global(nav#rail svg) {
    fill: white;
  }

  :global(.rail-btn) {
    margin: 0.75em 0;
  }

  :global(nav#rail .rail-btn[data-selected=true] svg) {
    fill: #00BFA5; /* color for selected rail button, should match theme */
  }

  /* Fix for SVGs not being vertically centered in icon button. Doesn't seem to
   * affect Chromium, which is probably why it was missed. Considered patching
   * it in the @material source but it is determined by a Sass mixin, so it's
   * clearer to fix it here. */
  :global(.mdc-icon-button) {
    font-size: unset;
  }

  @media (max-width: 36rem) {
    div.rail-overflow-wrapper {
      background: transparent;
      position: absolute;
      width: 100%;
      box-shadow: none;
    }

    nav {
      flex-direction: row;
      width: min-content;
    }

    :global(.rail-btn) {
      margin: 0 0.5em;
      /* multiple shadows used to increase intensity */
      filter:
        drop-shadow(0 0 0.125em black)
        drop-shadow(0 0 0.25em rgba(0, 0, 0, 0.5));
    }
  }
</style>
