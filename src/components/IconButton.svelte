<script>
  import tooltip from '../tooltip.js';

  export let name = null;
  export let action = () => {};
  export let selected = false;
  export let tipPlacement = 'right';
  export let ariaLabel = '';
</script>

<button
  aria-label={name || ariaLabel}
  on:click={action}
  use:tooltip={{content: name, placement: tipPlacement}}
  class:selected
>
  <slot></slot>
</button>

<style>
  button {
    all: unset;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: white;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0);
    transition: background-color 0.25s ease 0s;
  }

  button:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }

  button:focus {
    background-color: rgba(255, 255, 255, 0.15);
  }

  button.selected {
    color: var(--primary-color-light);
  }
</style>
