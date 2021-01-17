<script>
  import tooltip from '../tooltip.js';
  export let disabled = false;
  export let action = () => {};
  export let flex = false;
  export let full = false;
  export let secondary = false;
  export let type = 'button';
  export let tip = '';
  export let tipPlacement = 'top';
</script>

<button
  on:click={action}
  {disabled}
  class:flex
  class:full
  class:secondary
  type={type}
  use:tooltip={{content: tip, placement: tipPlacement}}
>
  <slot></slot>
</button>

<style>
  button {
    all: unset;
    -webkit-tap-highlight-color: transparent;
    box-sizing: border-box;
    color: white;
    padding: 0.5em 1em;
    text-align: center;
    text-transform: uppercase;
    background-color: #015B5B;
    border-radius: 4px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;

    display: flex;
    align-items: center;
    justify-content: center;

    min-height: 36px;
    min-width: 48px;
  }

  button.flex {
    flex: 1;
    margin-left: 0.5em;
  }

  button.flex:first-child {
    margin-left: 0;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  button.flex:last-child {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

  button.full {
    width: 100%;
  }

  button.secondary {
    background-color: #525260;
  }

  button:focus, button:hover {
    filter: brightness(125%);
  }

  button:disabled {
    cursor: auto;
    background-color: rgba(0, 0, 0, 0.88);
    color: rgba(255, 255, 255, 0.58);
    filter: none;
  }
</style>
