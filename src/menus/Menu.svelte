<script>
  import IconButton from '@smui/icon-button';
  import ArrowLeft24 from "carbon-icons-svelte/lib/ArrowLeft24";
  import TopAppBar, { Row, Section, Title } from '@smui/top-app-bar';

  export let openedMenu;
  export let menuName;
</script>

<aside class:open={openedMenu === menuName}>
  <TopAppBar variant="static" color="secondary">
    <Row>
      <Section>
        <IconButton on:click={() => openedMenu = null}>
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
      margin-top: 100vh;
      transition: margin-top 0.3s ease 0s, visibility 0s linear 0.3s;

      position: absolute;
      z-index: 2;
    }

    aside.open {
      margin-top: 0;
      transition: margin-top 0.3s ease 0s, visibility 0s linear 0s;
    }
  }
</style>
