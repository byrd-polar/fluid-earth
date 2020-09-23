<script>
  import { onMount, tick } from 'svelte';
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
  import Globe32 from "carbon-icons-svelte/lib/Globe32";
  import Grid32 from "carbon-icons-svelte/lib/Grid32";
  import ColorPalette32 from "carbon-icons-svelte/lib/ColorPalette32";

  export let openedMenu;
  let drawerOpen = false;

  function openDrawer() {
    openedMenu = null;
    drawerOpen = true;
  }

  async function openMenu(menu) {
    drawerOpen = false;
    openedMenu = menu;
    await tick();
    document.querySelector('aside.open button').focus({preventScroll:true});
  }

  function toggleMenu(menu) {
    if (openedMenu === menu) {
      openedMenu = null;
    } else {
      openMenu(menu);
    }
  }

  onMount(() => {
    let drawer = document.querySelector('#drawer');
    drawer.addEventListener('transitionend', () => {
      if (openedMenu !== null) {
        // needed again here because Material Design focuses back on the button
        // that opened the drawer by default
        document.querySelector('aside.open button').focus({preventScroll:true});
      }
    });
  });

  // fix an issue with tabindex in list in drawer by setting all to -1 when
  // drawer closes (then some MDC code will set the first one to 0)
  $: if (!drawerOpen) {
    document.querySelectorAll('aside.mdc-drawer span.mdc-list-item')
            .forEach(e => e.setAttribute('tabindex', '-1'));
  }
</script>

<nav id="rail">
  <IconButton class="rail-btn" on:click={openDrawer}>
    <Menu32 />
  </IconButton>
  <IconButton
    class="rail-btn"
    data-selected={openedMenu === 'Demo Menu 1'}
    on:click={() => toggleMenu('Demo Menu 1')}
  >
    <Globe32 />
  </IconButton>
  <IconButton
    class="rail-btn"
    data-selected={openedMenu === 'Demo Menu 2'}
    on:click={() => toggleMenu('Demo Menu 2')}
  >
    <Grid32 />
  </IconButton>
  <IconButton
    class="rail-btn"
    data-selected={openedMenu === 'Demo Menu 3'}
    on:click={() => toggleMenu('Demo Menu 3')}
  >
    <ColorPalette32 />
  </IconButton>
</nav>
<Drawer variant="modal" bind:open={drawerOpen} id="drawer">
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
      <Item on:SMUI:action={() => openMenu('Demo Menu 1')}>
        <Graphic>
          <Globe32 />
        </Graphic>
        <Text>Demo Menu 1</Text>
      </Item>
      <Item on:SMUI:action={() => openMenu('Demo Menu 2')}>
        <Graphic>
          <Grid32 />
        </Graphic>
        <Text>Demo Menu 2</Text>
      </Item>
      <Item on:SMUI:action={() => openMenu('Demo Menu 3')}>
        <Graphic>
          <ColorPalette32 />
        </Graphic>
        <Text>Demo Menu 3</Text>
      </Item>
    </List>
  </Content>
</Drawer>
<Scrim/>

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

  :global(nav#rail .rail-btn[data-selected=true] svg) {
    fill: #00BFA5;
  }

  :global(#drawer > *) {
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
