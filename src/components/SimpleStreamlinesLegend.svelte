<script>
  import Play from 'carbon-icons-svelte/lib/PlayOutlineFilled.svelte';
  import Pause from 'carbon-icons-svelte/lib/PauseOutlineFilled.svelte';
  import { capitalizeFirstLetter, handleLikeButton } from '../utility.js';
  import tooltip from '../tooltip.js';

  export let particleName;
  export let particlesPaused;

  function togglePaused() {
    particlesPaused = !particlesPaused;
  }
</script>

<section
  on:click={togglePaused}
  on:keydown={handleLikeButton(togglePaused)}
  use:tooltip={{ content: 'Pause/play animation', placement: 'top'}}
  role="button"
  tabindex="0"
>
  <h3>{capitalizeFirstLetter(particleName)}</h3>
  <!-- Classes instead of if/else to avoid losing focus on Android Chrome -->
  <Play size={32} class={!particlesPaused ? 'hidden' : undefined} />
  <Pause size={32} class={particlesPaused ? 'hidden' : undefined} />
</section>

<style>
  section {
    padding: 0.25rem 0.75rem;
    pointer-events: auto;
    border-radius: 4px;
    transition: background-color 0.25s ease 0s;
    cursor: pointer;

    margin-left: auto;
    margin-top: auto;
    display: flex;
    align-items: center;
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
    margin-right: 0.5em;
    font-size: 1em;
  }

  section :global(svg) {
    filter: drop-shadow(0 0 0.25em black);
    flex-shrink: 0;
  }

  section :global(.hidden) {
    display: none;
  }
</style>
