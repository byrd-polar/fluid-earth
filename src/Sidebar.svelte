<script>
  export let openedMenu;

  function toggleDemo() {
    if (openedMenu === 'Demo') {
      openedMenu = null;
    } else {
      openedMenu = 'Demo';
    }
  }
</script>

<nav on:click={toggleDemo}></nav>

<style>
  nav {
    background: grey;
    width: 3.5em;
    z-index: 2;
    cursor: pointer;
  }

  @media (max-width: 36rem) {
    nav {
      position: absolute;
      height: 3.5em;
      width: 100%;
      opacity: 0.5;
    }
  }
</style>
