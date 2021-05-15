<script>
  import { capitalizeFirstLetter } from '../utility.js';
  import tooltip from '../tooltip.js';

  export let particleDataset;
  export let particleDisplay;
  export let particlesPaused;

  // updates when changing display independently of dataset (or after dataset
  // download completes)
  $: info = particleDisplay;
  // updates immediately after selecting dataset instead of after download
  $: info = particleDataset.particleDisplay;

  function handleKeydown(e) {
    if (!(e.code === 'Space' || e.code === 'Enter')) return;

    particlesPaused = !particlesPaused
  }
</script>

<section
  on:click={() => particlesPaused = !particlesPaused}
  on:keydown={handleKeydown}
  use:tooltip={{ content: 'Pause/play animation', placement: 'top'}}
  tabindex="0"
>
  <h3>{capitalizeFirstLetter(particleDataset.name)}</h3>
  <div class:paused={particlesPaused}></div>
  <span>
    {#if particlesPaused}
      particle animation paused
    {:else}
      {info.rate.toLocaleString()} times faster than actual
    {/if}
  </span>
</section>

<style>
  section {
    flex: 1;
    padding: 0.25rem 0.75rem;
    max-width: 32em;
    flex-basis: 24em;
    pointer-events: auto;
    border-radius: 4px;
    -webkit-tap-highlight-color: transparent;
    cursor: pointer;

    margin-left: auto;
  }

  section:focus, section:hover {
    background-color: var(--input-color);
    outline: none;
  }

  section:focus:not(:focus-visible):not(:hover) {
    background-color: inherit;
  }

  h3 {
    margin: 0;
    font-size: 1em;
  }

  @keyframes slide {
    from { background-position-x: 0; }
    to   { background-position-x: 0.8em; }
  }

  div {
    height: 0.8em;

    background-image:
      radial-gradient(#ffffff88 0%, #ffffff88 60%, transparent 60%);
    background-position: 0 -0.05em;
    background-size: 0.8em 0.8em;
    animation: slide 0.3s linear;
    animation-iteration-count: infinite;
  }

  div.paused {
    animation-play-state: paused;
  }

  span {
    font-size: 0.75rem;
    min-height: 1.25rem;

    display: block;
    text-align: center;
    border-top: 1px solid white;
  }
</style>
