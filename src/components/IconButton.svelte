<script>
  import tooltip from '../tooltip.js';

  export let name = null;
  export let action = () => {};
  export let selected = false;
</script>

<button
  aria-label={name}
  on:click={action}
  use:tooltip={{content: name}}
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
  }

  button.selected {
    color: #00BFA5; /* should match theme */
  }
</style>
