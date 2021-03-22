<script>
  import { capitalizeFirstLetter } from '../utility.js';
  import tooltip from '../tooltip.js';
  import WindStream32 from "carbon-icons-svelte/lib/WindStream32";

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
  <div class="wind-icon">
    <WindStream32 />
  </div>
  <div>
    <h3>{capitalizeFirstLetter(particleDataset.name)}</h3>
    <span>
      {#if particlesPaused}
        particle animation paused
      {:else}
        {info.rate.toLocaleString()} times faster than actual
      {/if}
    </span>
  </div>
</section>

<style>
  section {
    padding: 0.25rem 0.75rem;
    pointer-events: auto;
    border-radius: 4px;
    -webkit-tap-highlight-color: transparent;
    transition: background-color 0.25s ease 0s;
    cursor: pointer;

    margin-right: auto;

    display: flex;
    flex-direction: row;
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

  div.wind-icon {
    padding-top: 0.25em;
    margin-right: 0.5em;
  }

  div.paused {
    animation-play-state: paused;
  }

  span {
    font-size: 0.75rem;
    min-height: 1.25rem;

    display: block;
    border-top: 1px solid white;
  }
</style>
