<script>
  import { tick } from 'svelte';
  import { modulo } from '../math.js';
  import { createEventDispatcher } from 'svelte';

  export let options = ['test option'];
  export let selected = options[0];
  export let iconsMap = {};
  export let nowrap = false;

  const dispatch = createEventDispatcher();
  let div;

  $: noneSelected = !options.some(option => selected === option);

  async function handleKeydown(e) {
    if (!['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      return;
    }

    e.preventDefault(); // prevent scrolling with up/down arrow keys

    let index = noneSelected ? 0 : options.findIndex(opt => selected === opt);
    if (['ArrowRight', 'ArrowDown'].includes(e.key)) {
      index++;
    } else {
      index--;
    }

    select(options[modulo(index, options.length)]);

    await tick();
    div.querySelector('.selected').focus();
  }

  function select(value) {
    if (value === selected) return;

    selected = value;
    dispatch('select');
  }
</script>

<div bind:this={div} class:nowrap>
  {#each options as option, i}
    <button
      on:click={() => select(option)}
      class:selected={selected === option}
      on:keydown={handleKeydown}
      tabindex={(selected === option || (i === 0 && noneSelected)) ? 0 : -1}
    >
      {#if iconsMap[option]}
        <svelte:component this={iconsMap[option]} size={20} />
      {/if}
      {option}
    </button>
  {/each}
</div>


<style>
  div {
    display: flex;
    flex-wrap: wrap;
  }

  div.nowrap {
    flex-wrap: nowrap;
    overflow: auto hidden;
  }

  button {
    all: unset;
    border: gray 2px solid;
    padding: 0.25em 0.5em;
    margin: 0 0.25em 0.5em 0;
    border-radius: 1em;
    display: flex;
    align-items: center;
    cursor: pointer;
    background-color: rgba(29, 29, 29, 0.75);
    transition:
      background-color 0.25s ease 0s,
      filter 0.25s ease 0s;
  }

  button > :global(svg) {
    margin-right: 0.25em;
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
