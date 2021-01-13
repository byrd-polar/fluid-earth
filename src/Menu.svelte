<script>
  import { updateAllWebglResolutions } from './map/Map.svelte';
  import { onMount } from 'svelte';
  import IconButton from './components/IconButton.svelte';
  import ArrowLeft24 from "carbon-icons-svelte/lib/ArrowLeft24";
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

  function closeMenu() {
    // foucs on the rail button that corresonds to this menu
    aside.parentNode.querySelector('div.rail button.selected').focus();
    openedMenu = null;
    // hide the tooltip for the just-closed menu
    tips.forEach(t => t.hide());
  }

  let aside;
  onMount(() => {
    aside.addEventListener('transitionend', e => {
      if (e.propertyName === 'margin-left') {
        updateAllWebglResolutions();
      }
    });
  });
</script>

<aside
  class:open={menuOpen}
  class:no-animate={noAnimate}
  bind:this={aside}
>
  <header>
    <IconButton action={closeMenu}>
      <ArrowLeft24 />
    </IconButton>
    <h1>{menuName}</h1>
  </header>
  <div>
    <section>
      <slot></slot>
    </section>
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

  header {
    background-color: #015B5B;
    height: 64px;
    padding: 8px 12px;
    display: flex;
    align-items: center;
    box-shadow:
      0 2px  4px -1px rgba(0,0,0,.2),
      0 4px  5px  0   rgba(0,0,0,.14),
      0 1px 10px  0   rgba(0,0,0,.12);
  }

  header :global(button) {
    margin-right: 12px;
  }

  header h1 {
    color: white;
    font-weight: 500;
    font-size: 1.25rem;
  }

  div {
    overflow: auto;
    flex: 1;
  }

  section {
    padding: 1em;
  }

  section :global(h2) {
    font-family: Quicksand-regular;
    font-size: 1rem;
    font-weight: 400;
    border-bottom: 1px solid;
    text-transform: uppercase;
  }

  section :global(:first-child) {
    margin-top: 0;
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

      background-color: rgba(29, 29, 29, 0.75);
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

    header {
      padding: 4px;
    }

    header :global(button) {
      margin-right: 4px;
    }
  }
</style>
