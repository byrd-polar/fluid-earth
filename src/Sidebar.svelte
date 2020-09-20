<script>
  import IconButton from '@smui/icon-button';
  import Drawer, {
    Content,
    Header,
    Title,
    Subtitle,
    Scrim,
  } from '@smui/drawer';
  import List, {
    Item,
    Graphic,
    Text,
    Separator,
  } from '@smui/list';

  // not using { Icon } import syntax for significantly faster build times, as
  // recommended in the carbon-icons-svelte README
  import Menu32 from "carbon-icons-svelte/lib/Menu32";
  import Chemistry32 from "carbon-icons-svelte/lib/Chemistry32";

  export let openedMenu;
  let drawerOpen = false;

  function toggleDrawer() {
    drawerOpen = !drawerOpen;
    if (drawerOpen) {
      openedMenu = null;
    }
  }

  function openMenu(menu) {
    drawerOpen = false;
    openedMenu = menu;
  }

  function toggleMenu(menu) {
    if (openedMenu === menu) {
      openedMenu = null;
    } else {
      openMenu(menu);
    }
  }
</script>

<nav id="rail">
  <IconButton class="rail-btn" on:click={toggleDrawer}>
    <Menu32 />
  </IconButton>
  {#each {length: 3} as _}
  <IconButton class="rail-btn" on:click={() => toggleMenu('Demo')}>
    <Chemistry32 />
  </IconButton>
  {/each}
</nav>
<div class="drawer-container">
  <Drawer variant="modal" bind:open={drawerOpen}>
    <Header>
      <Title>Fluid Earth Viewer 2</Title>
      <Subtitle>From the FEVer Team at Byrd</Subtitle>
    </Header>
    <Content>
      <List>
        <!--
          SMUI:action also listens for space and enter keys, so that the span
          element acts like a button with on:click
        -->
        {#each {length: 3} as _}
        <Item on:SMUI:action={() => openMenu('Demo')}>
          <Graphic>
            <Chemistry32 />
          </Graphic>
          <Text>Demo Menu</Text>
        </Item>
        {/each}
      </List>
    </Content>
  </Drawer>
  <Scrim/>
</div>

<style>
  nav {
    background: #202124;
    z-index: 2;
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
    margin: 0.5em 0;
  }

  :global(div.drawer-container > *) {
    user-select: none;
  }

  @media (max-width: 36rem) {
    nav {
      flex-direction: row;
      background: transparent;
      position: absolute;
      height: 3.5em;
      width: 100%;
    }

    :global(.rail-btn) {
      margin: 0 0.5em;
    }
  }
</style>
