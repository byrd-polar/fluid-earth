<script>
  import { tooltip, tips } from './tooltip.js';
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
  import ArrowLeft32 from "carbon-icons-svelte/lib/ArrowLeft32";
  import Globe32 from "carbon-icons-svelte/lib/Globe32";
  import Grid32 from "carbon-icons-svelte/lib/Grid32";
  import ColorPalette32 from "carbon-icons-svelte/lib/ColorPalette32";
  import EarthFilled32 from "carbon-icons-svelte/lib/EarthFilled32";
  import WatsonHealthFusionBlender32 from "carbon-icons-svelte/lib/WatsonHealthFusionBlender32";

  export let openedMenu;

  const menus = [
    { name: 'Map Projections', icon: Globe32 },
    { name: 'Gridded Datasets', icon: Grid32 },
    { name: 'Colormaps', icon: ColorPalette32 },
    { name: 'Map Options', icon: EarthFilled32 },
    { name: 'Zoom Slider', icon: WatsonHealthFusionBlender32 }
  ];

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
      } else {
        // hide the Menu tooltip when just closing the menu
        tips.forEach(t => t.hide());
      }
    });

    // hide tooltips on small screens / mobile
    let mediaQuery = window.matchMedia('(max-width: 36rem)');
    function handleResize() {
      if (mediaQuery.matches) {
        tips.forEach(t => t.disable());
      } else {
        tips.forEach(t => t.enable());
      }
    }
    window.addEventListener('resize', handleResize);
    handleResize();
  });

  // fix an issue with tabindex in list in drawer by setting all to -1 when
  // drawer closes (then some Material Design code will set the first one to 0)
  $: if (!drawerOpen) {
    document.querySelectorAll('aside.mdc-drawer span.mdc-list-item')
            .forEach(e => e.setAttribute('tabindex', '-1'));
  }
</script>

<div class="rail-overflow-wrapper">
<nav id="rail">
  <IconButton
    class="rail-btn"
    on:click={openDrawer}
    use={[[tooltip, {content: 'Menus'}]]}
  >
    <Menu32 />
  </IconButton>
  {#each menus as menu}
    <IconButton
      class="rail-btn"
      data-selected={openedMenu === menu.name}
      on:click={() => toggleMenu(menu.name)}
      use={[[tooltip, {content: menu.name}]]}
    >
      <svelte:component this={menu.icon}/>
    </IconButton>
  {/each}
</nav>
</div>
<Drawer variant="modal" bind:open={drawerOpen} id="drawer">
  <Header>
    <Title>Fluid Earth Viewer 2</Title>
    <Subtitle>From the FEVer Team at Byrd</Subtitle>
  </Header>
  <Content>
    <List>
      <!--
        SMUI:action also listens for space and enter keys, so that the span
        element in <Item> acts like a button with on:click
      -->
      <Item on:SMUI:action={() => drawerOpen = false}>
        <Graphic>
          <ArrowLeft32 />
        </Graphic>
        <Text>Return to map</Text>
      </Item>
      {#each menus as menu}
        <Item on:SMUI:action={() => openMenu(menu.name)}>
          <Graphic>
            <svelte:component this={menu.icon}/>
          </Graphic>
          <Text>{menu.name}</Text>
        </Item>
      {/each}
    </List>
  </Content>
</Drawer>
<Scrim/>

<style>
  div.rail-overflow-wrapper {
    z-index: 2;
    background: #202124;
    overflow: auto;
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
    margin: 0.5em 0;
  }

  :global(nav#rail .rail-btn[data-selected=true] svg) {
    fill: #00BFA5; /* color for selected rail button, should match theme */
  }

  :global(#drawer) {
    z-index: 10000; /* place above tooltip (z-index: 9999) when opening */
  }

  :global(#drawer > *) {
    user-select: none;
  }

  @media (max-width: 36rem) {
    div.rail-overflow-wrapper {
      background: transparent;
      position: absolute;
      width: 100%;
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
