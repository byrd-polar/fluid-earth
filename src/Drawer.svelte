<script>
  import { tips } from './tooltip.js';
  import { onMount } from 'svelte';
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
  import ArrowLeft32 from "carbon-icons-svelte/lib/ArrowLeft32";

  export let menus;
  export let openedMenu;
  export let drawerOpen;

  function openMenu(menu) {
    drawerOpen = false;
    openedMenu = menu;
  }

  onMount(() => {
    let drawer = document.querySelector('#drawer');
    drawer.addEventListener('transitionend', () => {
      if (openedMenu !== null) {
        // needed again here because Material Design focuses back on the button
        // that opened the drawer by default
        document.querySelector('aside.open button').focus({preventScroll:true});
      } else {
        // hide the Menus tooltip when just closing the drawer
        tips.forEach(t => t.hide());
      }
    });
  });

  // fix an issue with tabindex in list in drawer by setting all to -1 when
  // drawer closes (then some Material Design code will set the first one to 0)
  $: if (!drawerOpen) {
    document.querySelectorAll('aside.mdc-drawer span.mdc-list-item')
            .forEach(e => e.setAttribute('tabindex', '-1'));
  }
</script>

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
  :global(#drawer) {
    z-index: 10000; /* place above tooltip (z-index: 9999) when opening */
    background-color: #015B5B;
  }

  :global(#drawer *) {
    color: white;
  }

  :global(#drawer > *) {
    user-select: none;
  }
</style>
