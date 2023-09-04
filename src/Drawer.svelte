<script>
  import { tips } from './tooltip.js';
  import { onMount, tick } from 'svelte';
  import List from './components/List.svelte';
  import Button from './components/Button.svelte';
  import { createFocusTrap } from 'focus-trap';

  import Blog from 'carbon-icons-svelte/lib/Blog.svelte';
  import Facebook from 'carbon-icons-svelte/lib/LogoFacebook.svelte';
  import Twitter from 'carbon-icons-svelte/lib/LogoTwitter.svelte';
  import Github from 'carbon-icons-svelte/lib/LogoGithub.svelte';

  export let menus;
  export let openedMenu;
  export let drawerOpen;
  export let kioskMode;

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
    if (e.key === 'Escape' && drawerOpen) {
      closeDrawer();
    }
  }

  $: links = drawer ? drawer.querySelectorAll('a') : [];

  $: if (kioskMode) {
    for (let link of links) {
      link.setAttribute('data-href', link.getAttribute('href'));
      link.removeAttribute('href');
    }
  } else {
    for (let link of links) {
      let href = link.getAttribute('data-href');
      if (href) {
        link.setAttribute('href', href);
        link.removeAttribute('date-href');
      }
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<aside
  class:open={drawerOpen}
  bind:this={drawer}
>
  <header>
    <h1>
      <img width="42" height="42" alt="logo" src="/images/logo.svg">
      Fluid Earth
    </h1>
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
  </section>
  <footer>
    <a href="https://byrd.osu.edu/" style="grid-column: 1 / -1">
      <img
        width="224"
        height="33"
        alt="The Ohio State University"
        src="/images/TheOhioStateUniversity-REV-Horiz-RGBHEX.png"
        style="width: 100%"
      >
    </a>
    <a href="https://www.nsf.gov/funding/pgm_summ.jsp?pims_id=504793">
      <img
        width="48"
        height="48"
        alt="National Science Foundation"
        src="/images/NSF_4-Color_bitmap_Logo.png"
        style="margin-left: -8px"
      >
    </a>
    <a href="https://u.osu.edu/fever/">
      <Blog size={32} aria-label="Blog" />
    </a>
    <a href="https://www.facebook.com/byrdpolar">
      <Facebook size={32} aria-label="Facebook" />
    </a>
    <a href="https://twitter.com/ByrdPolar">
      <Twitter size={32} aria-label="Twitter" />
    </a>
    <a href="https://github.com/byrd-polar/fluid-earth">
      <Github size={32} aria-label="Github" />
    </a>
  </footer>
</aside>
<!-- svelte-ignore
  a11y-click-events-have-key-events
  a11y-no-static-element-interactions
-->
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

    display: flex;
    flex-direction: column;

    overflow: hidden auto;
    scrollbar-color: grey transparent;

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

  header {
    padding: 16px 16px 0;
  }

  h1 {
    font-size: 30px;
    margin: 0 0 16px;
    white-space: nowrap;
  }

  h1 img {
   vertical-align: text-bottom;
   margin: 0 0.125em 0 -2px;
  }

  span.line {
    display: block;
    width: 100%;
    height: 1px;
    background-color: white;
    margin: 0.5em 0;
  }

  section.info {
    padding: 0 16px;
    font-size: 0.9em;
    margin: auto 0;
  }

  a {
    color: inherit;
  }

  footer {
    padding: 0 16px 16px 16px;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 16px 8px;
    align-items: center;
  }

  footer a > :global(*) {
    display: block;
  }

  div.scrim {
    z-index: 9999;
    background-color: black;
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
