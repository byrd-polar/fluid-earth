<script>
  import tooltip from '../tooltip.js';
  import { fade } from 'svelte/transition';

  export let disabled = false;
  export let action = () => {};
  export let flex = false;
  export let full = false;
  export let secondary = false;
  export let type = 'button';
  export let tip = '';
  export let tipPlacement = 'top';
  export let transition = false;
</script>

<button
  on:click={action}
  {disabled}
  class:flex
  class:full
  class:secondary
  type={type}
  use:tooltip={{content: tip, placement: tipPlacement}}
  transition:fade={{duration: transition ? 400 : 0}}
>
  <slot></slot>
</button>

<style>
  button {
    all: unset;
    transition: filter 0.25s ease 0s;
    box-sizing: border-box;
    color: white;
    padding: 8px 16px;
    text-align: center;
    text-transform: uppercase;
    background-color: var(--primary-color);
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
    background-color: var(--secondary-color);
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
