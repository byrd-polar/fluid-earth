<script>
  import { fade } from 'svelte/transition';

  export let openedMenu;
  export let kioskMode;

  const storageKey = 'fev2r-welcome-notification-dismissed';

  let dismissed = localStorage.getItem(storageKey) === 'true';

  function action() {
    openedMenu = 'Help & About';
  }

  $: if (openedMenu === 'Help & About' || kioskMode) {
    dismiss();
  }

  function dismiss() {
    dismissed = true;
  }

  function dismissByUser() {
    dismiss();
    localStorage.setItem(storageKey, 'true')
  }
</script>

{#if !dismissed}
  <div class="wrapper" out:fade={{ duration: 250 }}>
    <section>
      <div>
        Welcome to the new Fluid Earth!
      </div>
      <button on:click={action}>
        View tutorial
      </button>
      <button on:click={dismissByUser}>
        Dismiss
      </button>
    </section>
  </div>
{/if}

<style>
  div.wrapper {
    padding: 0.75rem;
    height: 0; /* avoid influencing position of overlay side controls */
  }

  section {
    background: hsl(0 0% 8% / 0.8);
    backdrop-filter: blur(5px);
    filter: drop-shadow(0 0 0.125em black);

    border-radius: 4px;
    overflow: hidden;
    margin: 0 auto;

    -webkit-tap-highlight-color: transparent;
    pointer-events: auto;

    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  section div {
    grid-column: 1 / span 2;
    padding: 0.5em 1em;
  }

  button {
    all: unset;
    transition: filter 0.25s ease 0s;
    text-align: center;
    color: var(--primary-color-light);
    padding: 0.5em;
    cursor: pointer;
  }

  button:focus, button:hover {
    background: hsl(0 0% 0% / 0.3);
  }

  @media (max-width: 576px) {
    div.wrapper {
      height: auto;
      width: 100%;
      display: flex;
      justify-content: center;
      font-size: 0.875em;
    }
  }
</style>
