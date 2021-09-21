<script>
  import Close from 'carbon-icons-svelte/lib/CloseOutline24';
  import { fade } from 'svelte/transition';
  import { mobile } from '../stores.js';

  export let openedMenu;
  export let kioskMode;

  let dismissed = false;

  function action() {
    openedMenu = 'Help & About';
  }

  $: if (openedMenu === 'Help & About' || kioskMode) {
    dismiss();
  }

  function dismiss() {
    dismissed = true;
  }
</script>

{#if !dismissed}
  <div class="wrapper" out:fade={{ duration: 250 }}>
    <section>
      <button class="action" on:click={action}>
        Welcome{#if !$mobile}{' to the new Fluid Earth'}{/if}!
        Click here to view the tutorial.
      </button>
      <button class="dismiss" on:click={dismiss} ariaLabel="Close notification">
        <Close />
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
    background: var(--secondary-color);
    filter: drop-shadow(0 0 0.125em black);

    border-radius: 4px;
    overflow: hidden;
    margin: 0 auto;

    -webkit-tap-highlight-color: transparent;
    cursor: pointer;
    pointer-events: auto;

    display: flex;
    align-items: stretch;
  }

  button {
    all: unset;
    background: inherit;
    padding: 0.5em;
    transition: filter 0.25s ease 0s;
  }

  button:focus, button:hover {
    filter: brightness(125%);
  }

  button.dismiss {
    display: flex;
    align-items: center;
  }

  @media (max-width: 36rem) {
    div.wrapper {
      height: auto;
      width: 100%;
      display: flex;
      justify-content: center;
      font-size: 0.875em;
    }
  }
</style>
