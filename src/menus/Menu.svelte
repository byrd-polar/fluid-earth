<script>
  import IconButton from '@smui/icon-button';
  import ArrowLeft24 from "carbon-icons-svelte/lib/ArrowLeft24";
  import TopAppBar, { Row, Section, Title } from '@smui/top-app-bar';

  export let openedMenu;
  export let menuName;

  // avoid animating menu open/close when there is already a menu open
  let previousOpenedMenu = null;
  let noAnimate;
  $: {
    noAnimate = (previousOpenedMenu !== null && openedMenu !== null);
    previousOpenedMenu = openedMenu;
  }

  function closeMenu() {
    // foucs on the rail button that corresonds to this menu
    document.querySelector('.rail-btn[data-selected=true]').focus()
    openedMenu = null;
  }
</script>

<aside class:open={openedMenu === menuName} class:no-animate={noAnimate}>
  <TopAppBar variant="static" color="secondary">
    <Row>
      <Section>
        <IconButton on:click={closeMenu}>
          <ArrowLeft24 />
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
    width: 28em;
    margin-left: -28em;
    visibility: hidden;
    transition: margin-left 0.3s ease 0s, visibility 0s linear 0.3s;
    background-color: white;
    display: flex;
    flex-direction: column;
    z-index: 0;
  }

  aside.open {
    visibility: visible;
    margin-left: 0;
    transition: margin-left 0.3s ease 0s, visibility 0s linear 0s;
  }

  aside.no-animate {
    transition: none;
  }

  div {
    padding: 1em;
    flex: 1;
    overflow: auto;
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
        visibility 0s linear 0.3s;

      position: absolute;
      z-index: 2;
    }

    aside.open {
      opacity: 1;
      transform: translateY(0%);
      transition:
        opacity 0.3s ease 0s,
        transform 0.3s ease 0s,
        visibility 0s linear 0s;
    }
  }
</style>
