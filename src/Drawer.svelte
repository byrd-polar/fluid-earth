<script>
  import { tips } from './tooltip.js';
  import { onMount, tick } from 'svelte';
  import List from './components/List.svelte';
  import Button from './components/Button.svelte';
  import { createFocusTrap } from 'focus-trap';
  import overlayscroll from './overlayscroll.js';

  import Blog32 from "carbon-icons-svelte/lib/Blog32";
  import LogoFacebook32 from "carbon-icons-svelte/lib/LogoFacebook32";
  import LogoTwitter32 from "carbon-icons-svelte/lib/LogoTwitter32";
  import LogoGithub32 from "carbon-icons-svelte/lib/LogoGithub32";

  export let menus;
  export let openedMenu;
  export let drawerOpen;

  let drawer, scrim, focusTrap;
  onMount(() => focusTrap = createFocusTrap([drawer, scrim], {
    // we'll handle the following cases manually
    escapeDeactivates: false,
    returnFocusOnDeactivate: false,
  }));

  $: if (drawerOpen) { (async () => {
    await tick();
    focusTrap.activate();
  })() }

  function closeDrawer() {
    drawerOpen = false;
    focusTrap.deactivate();
    // focus on the button that opened the drawer when the drawer is dismissed
    // (and no other menu is opened)
    if (openedMenu === null) {
      drawer.parentNode.querySelector('div.rail button').focus();
    }
    tips.forEach(t => t.hide());
  }

  function openMenu(menu) {
    openedMenu = menu.name;
    closeDrawer();
  }

  function handleKeydown(e) {
    if (e.key === 'Escape') {
      closeDrawer();
    }
  }
</script>

<aside
  class:open={drawerOpen}
  bind:this={drawer}
  on:keydown={handleKeydown}
  use:overlayscroll
>
<div class="wrapper">
  <header>
    <h1>
      <img width="42" height="42" alt="logo" src="/images/logo.svg">
      Fluid Earth
    </h1>
    <p>From the Byrd Polar and Climate Research Center</p>
    <Button action={closeDrawer} full>
      Return to map
    </Button>
    <span class="line"></span>
  </header>
  <section>
    <List
      items={menus}
      action={openMenu}
    />
  </section>
  <section class="info">
    <span class="line"></span>
    <p><strong>For educational use only.</strong></p>
    <p>Please consult official weather services for up-to-date information about
    severe weather events.</p>
    <p>You may visit the original
    <a href="https://fever.byrd.osu.edu/">FEVer</a>,
    and view the
    <a href="https://fev2r.netlify.app/legal/THIRD_PARTY">open source licences</a>
    for and
    <a href="https://fev2r.netlify.app/legal/MODIFICATIONS">modifications</a>
    to third-party libraries used on this site.
    </p>
  </section>
  <footer>
    <a href="https://byrd.osu.edu/">
      <img
        width="224"
        height="33"
        alt="The Ohio State University"
        src="/images/TheOhioStateUniversity-REV-Horiz-RGBHEX.png"
      >
    </a>
    <a href="https://www.nsf.gov/funding/pgm_summ.jsp?pims_id=504793">
      <img
        width="48"
        height="48"
        alt="National Science Foundation"
        src="/images/NSF_4-Color_bitmap_Logo.png"
      >
    </a>
    <a href="https://u.osu.edu/fever/">
      <Blog32 aria-label="Blog" />
    </a>
    <a href="https://www.facebook.com/byrdpolar">
      <LogoFacebook32 aria-label="Facebook" />
    </a>
    <a href="https://twitter.com/ByrdPolar">
      <LogoTwitter32 aria-label="Twitter" />
    </a>
    <a href="https://github.com/zqianem/fev2r">
      <LogoGithub32 aria-label="Github" />
    </a>
  </footer>
</div>
</aside>
<div
  class="scrim"
  class:open={drawerOpen}
  on:click={closeDrawer}
  bind:this={scrim}
></div>

<style>
  aside {
    background-color: var(--primary-color);
    color: white;

    z-index: 10000; /* place above tooltip (z-index: 9999) when opening */
    position: absolute;

    height: 100%;
    width: 256px;
    overflow: auto;

    margin-left: -256px;
    visibility: hidden;
    transition:
      margin-left 0.25s ease 0s,
      visibility 0s linear 0.25s;

    box-shadow:
      2px 0 1px -1px rgba(0,0,0,.2),
      1px 0 1px  0   rgba(0,0,0,.14),
      1px 0 3px  0   rgba(0,0,0,.12);
  }

  aside.open {
    margin-left: 0;
    visibility: visible;
    transition:
      margin-left 0.25s ease 0s,
      visibility 0s linear 0s;
  }

  div.wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  header {
    padding: 1em 1em 0;
  }

  header img {
    margin-left: -0.125em;
  }

  h1 {
    font-size: 1.8em;
    margin: 0 0 0.25em;
    white-space: nowrap;
  }

  header p {
    font-size: 0.9em;
    margin-top: 0.25em;
  }

  span.line {
    display: block;
    width: 100%;
    height: 1px;
    background-color: white;
    margin: 0.5em 0;
  }

  section.info {
    padding: 0 1em;
    font-size: 0.9em;
    margin: auto;
  }

  a {
    color: white;
  }

  footer {
    padding: 0 1em 1em 1em;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
  }

  footer a {
    color: inherit;
    margin-right: 0.5em;
    margin-top: 1em;
    flex: 1;
  }

  footer a:first-child, footer a:last-child {
    margin-right: 0;
  }

  footer a:nth-child(2) {
    margin-left: -7.875px;
  }

  footer a > :global(*) {
    display: block;
    margin: 0 auto;
  }

  div.scrim {
    z-index: 9999;
    background-color: black;
    -webkit-tap-highlight-color: transparent;
    width: 100%;
    height: 100%;
    position: absolute;

    cursor: auto;
    opacity: 0;
    visibility: hidden;
    transition:
      opacity 0.25s ease 0s,
      cursor 0s linear 0.25s,
      visibility 0s linear 0.25s;
  }

  div.scrim.open {
    cursor: pointer;
    opacity: 0.5;
    visibility: visible;
    transition:
      opacity 0.25s ease 0s,
      cursor 0s linear 0s,
      visibility 0s linear 0s;
  }
</style>
