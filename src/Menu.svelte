<script>
  import { updateAllWebglSizes } from './map/Map.svelte';
  import { onMount, tick } from 'svelte';
  import IconButton from '@smui/icon-button';
  import ArrowLeft32 from "carbon-icons-svelte/lib/ArrowLeft32";
  import TopAppBar, { Row, Section, Title } from '@smui/top-app-bar';
  import { tips } from './tooltip.js';

  export let openedMenu;
  export let menuName;

  // avoid animating menu open/close when there is already a menu open
  let previousOpenedMenu = null;
  let noAnimate;
  $: {
    noAnimate = (previousOpenedMenu !== null && openedMenu !== null);
    previousOpenedMenu = openedMenu;
  }

  let menuOpen;
  $: menuOpen = openedMenu === menuName;

  // switch keyboard focus to the back-button of the just-opened menu
  $: if (menuOpen) {
    (async () => {
      await tick();
      document.querySelector('aside.open button').focus({preventScroll:true});
    })();
  }

  function closeMenu() {
    // foucs on the rail button that corresonds to this menu
    document.querySelector('.rail-btn[data-selected=true]').focus()
    openedMenu = null;
    // hide the tooltip for the just-closed menu
    tips.forEach(t => t.hide());
  }

  let aside;
  onMount(() => {
    aside.addEventListener('transitionend', e => {
      if (e.propertyName === 'margin-left') {
        updateAllWebglSizes();
      }
    });
  });
</script>

<aside
  class:open={menuOpen}
  class:no-animate={noAnimate}
  bind:this={aside}
>
  <TopAppBar variant="static" class="top-app-drawer">
    <Row>
      <Section>
        <IconButton on:click={closeMenu} class="back-button">
          <ArrowLeft32 />
        </IconButton>
        <Title>{menuName}</Title>
      </Section>
    </Row>
  </TopAppBar>
  <div>
    <slot></slot>
  </div>
</aside>

<style>
  aside {
    background-color: #1d1d1d;
    color: hsla(0, 0%, 100%, .8);

    width: 28em;
    margin-left: -28em;
    visibility: hidden;
    transition:
      margin-left 0.3s ease 0s,
      visibility 0s linear 0.3s,
      z-index 0s linear 0.3s;
    display: flex;
    flex-direction: column;
    z-index: 0;
    box-shadow:
      2px 0 1px -1px rgba(0,0,0,.2),
      1px 0 1px  0   rgba(0,0,0,.14),
      1px 0 3px  0   rgba(0,0,0,.12);
  }

  aside.open {
    visibility: visible;
    margin-left: 0;
    transition:
      margin-left 0.3s ease 0s,
      visibility 0s linear 0s,
      z-index 0s linear 0s;
    z-index: 1;
  }

  aside.no-animate {
    transition: none;
  }

  div {
    padding: 1em;
    flex: 1;
    overflow: auto;
  }

  :global(.top-app-drawer) {
    box-shadow:
      0 2px  4px -1px rgba(0,0,0,.2),
      0 4px  5px  0   rgba(0,0,0,.14),
      0 1px 10px  0   rgba(0,0,0,.12);
  }

  :global(.back-button) {
    height: 42px;
    width: 42px;
    padding: 9px;
  }

  @media (max-width: 36rem) {
    aside {
      width: 100%;
      /*
        Hack using auto instead of 0 to avoid animating from this property,
        such as when resizing to > 36rem (avoids menu from appearing, then
        closing immediately, messing up the canvas resize by making it low-res)

        Seems to be supported by spec, see note about auto value here:
        https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Transitions/Using_CSS_transitions
       */
      margin-left: auto;

      height: 100%;
      opacity: 0;
      transform: translateY(10%);
      transition:
        opacity 0.3s ease 0s,
        transform 0.3s ease 0s,
        visibility 0s linear 0.3s,
        z-index 0s linear 0.3s;

      position: absolute;
      z-index: 0; /* ensure hidden menus are below Controls.svelte */
    }

    aside.open {
      opacity: 1;
      transform: translateY(0%);
      transition:
        opacity 0.3s ease 0s,
        transform 0.3s ease 0s,
        visibility 0s linear 0s,
        z-index 0s linear 0s;
      z-index: 2;
    }
  }
</style>
