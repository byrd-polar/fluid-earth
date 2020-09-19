<script>
  import IconButton from '@smui/icon-button';

  // not using { Icon } import syntax for significantly faster build times, as
  // recommended in the carbon-icons-svelte README
  import Menu32 from "carbon-icons-svelte/lib/Menu32";

  export let openedMenu;

  function toggleDemo() {
    if (openedMenu === 'Demo') {
      openedMenu = null;
    } else {
      openedMenu = 'Demo';
    }
  }
</script>

<nav>
  <IconButton on:click={toggleDemo}>
    <Menu32 class="icon"/>
  </IconButton>
</nav>

<style>
  nav {
    background: #202124;
    z-index: 2;
    display: flex;
    flex-direction: column;
    padding: 0.5em;
  }

  :global(svg.icon) {
    fill: white;
  }

  @media (max-width: 36rem) {
    nav {
      flex-direction: row;
      background: transparent;
      position: absolute;
      height: 3.5em;
      width: 100%;
    }
  }
</style>
