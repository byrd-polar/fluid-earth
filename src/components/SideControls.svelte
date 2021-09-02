<script>
  import Add from 'carbon-icons-svelte/lib/Add24';
  import Subtract from 'carbon-icons-svelte/lib/Subtract24';

  function zoomIn() {
    console.log('in');
  }

  function zoomOut() {
    console.log('out');
  }
</script>

<div class="sidedock">
  <button on:click={zoomIn}><Add /></button>
  <button on:click={zoomOut}><Subtract /></button>
</div>

<style>
  div.sidedock {
    background: var(--secondary-color-dark);
    display: flex;
    flex-direction: column;
    margin-left: auto;
    pointer-events: auto;
    padding: 0.5em 0.25em 0.5em 0.5em;
    border-radius: 1.5em 0 0 1.5em;
    filter: drop-shadow(0 0 0.125em black);
  }

  button {
    all: unset;
    display: flex;
    border-radius: 50%;
    background: var(--secondary-color);
    padding: 0.5em;
    cursor: pointer;
    transition: filter 0.25s ease 0s;
  }

  button + button {
    margin-top: 0.5em;
  }

  button:focus, button:hover {
    filter: brightness(125%);
  }

  button:focus:not(:focus-visible):not(:hover) {
    filter: none;
  }
</style>
