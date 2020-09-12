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
    background: lightgrey;
    width: 3em;
    z-index: 1;
    cursor: pointer;
  }
</style>
