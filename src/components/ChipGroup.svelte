<script>
  import { tick } from 'svelte';
  import { modulo } from '../utility.js';
  import { createEventDispatcher } from 'svelte';

  export let options = ['test option'];
  export let selected = options[0];

  const dispatch = createEventDispatcher();
  $: dispatch('select', { selected });

  let div;

  async function handleKeydown(e) {
    if (!['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      return;
    }

    e.preventDefault(); // prevent scrolling with up/down arrow keys

    let index = options.findIndex(opt => selected === opt);
    if (['ArrowRight', 'ArrowDown'].includes(e.key)) {
      index++;
    } else {
      index--;
    }

    selected = options[modulo(index, options.length)];
    await tick();
    div.querySelector('.selected').focus();
  }
</script>

<div bind:this={div}>
  {#each options as option}
    <button
      on:click={() => selected = option}
      class:selected={selected === option}
      on:keydown={handleKeydown}
      tabindex={selected === option ? 0 : -1}
    >
      {option}
    </button>
  {/each}
</div>


<style>
  div {
    display: flex;
    flex-wrap: wrap;
  }

  button {
    all: unset;
    -webkit-tap-highlight-color: transparent;
    border: gray 2px solid;
    padding: 0.25em 0.5em;
    margin: 0.25em 0.25em 0.25em 0;
    border-radius: 1em;
    display: block;
    cursor: pointer;
    background-color: rgba(29, 29, 29, 0.75);
    transition:
      background-color 0.25s ease 0s,
      filter 0.25s ease 0s;
  }

  button:focus, button:hover {
    filter: brightness(125%);
    background-color: rgba(255, 255, 255, 0.05);
  }

  button.selected {
    border: var(--primary-color-light) 2px solid;
    background-color: var(--primary-color);
  }
</style>
