<script>
  import Toggle from "svelte-toggle";
  import { onMount } from 'svelte';
  import tooltip from  '../tooltip.js';

  export let simplifiedMode;
  $: advancedMode = !simplifiedMode;
  $: if (simplifiedMode === advancedMode) updateMode();

  function updateMode() {
    simplifiedMode = !advancedMode;
  }

  let wrapper;
  onMount(() => tooltip(wrapper.querySelector('button'), {
    interactive: true,
    aria: {
      content: 'auto',
    },
    content: `
    <p>Advanced mode has:
    <ul>
      <li>additional dataset variables and heights
      <li>perceptually uniform colormaps
      <li>more technical language and legends
    </ul>
    `,
    allowHTML: true,
    placement: 'bottom-start',
  }).destroy);
</script>

<div bind:this={wrapper}>
  <Toggle
    bind:toggled={advancedMode}
    label={`Advanced mode ${simplifiedMode ? 'off' : 'on'}`}
    toggledColor="var(--primary-color-light)"
    untoggledColor="#ABABAB"
    style="margin-left: auto"
  />
</div>

<style>
  div {
    margin-left: auto;
  }

  div :global(label) {
    text-align: right;
    color: white;
  }

  div :global(button) {
    -webkit-tap-highlight-color: transparent;
  }

  div :global(button::after) {
    position: absolute;
    content: "";
    top: 0;
    bottom: 0;
    left: -0.75rem;
    margin: auto;
    height: 2.5rem;
    width: 2.5rem;
    text-align: center;
    border-radius: 50%;
    background-color: transparent;
    transition:
      transform 150ms ease-out,
      background-color 0.25s ease 0s;
  }

  div :global(button[aria-checked="true"]::after) {
    transform: translateX(1.375rem);
  }

  div :global(button:focus) {
    outline: none;
  }

  div :global(button:hover::after) {
    background-color: rgba(255, 255, 255, 0.05);
  }

  div :global(button:focus::after) {
    background-color: rgba(255, 255, 255, 0.15);
  }

  div :global(div[id^=tippy-] p) {
    margin: 0.25em 0.5em 0.5em;
  }

  div :global(div[id^=tippy-] ul) {
    padding-left: 1.25em;
    margin: 0.25em;
  }

  div :global(div[id^=tippy-] li) {
    margin: 0.25em 0;
  }
</style>
