<script>
  import { capitalizeFirstLetter } from '../utility.js';
  import tooltip from '../tooltip.js';
  import prng_alea from 'esm-seedrandom/esm/alea.mjs'

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

  let prng = prng_alea('hmm is this better?');

  const trailWidth = 5;
  const trailHeight = 0.3;
</script>

<section
  on:click={() => particlesPaused = !particlesPaused}
  on:keydown={handleKeydown}
  use:tooltip={{ content: 'Pause/play animation', placement: 'top'}}
  tabindex="0"
>
  <h3>{capitalizeFirstLetter(particleDataset.name)}</h3>
  <div
    class="legend"
    class:paused={particlesPaused}
    style="--trail-width: {trailWidth}em; --trail-height: {trailHeight}em"
  >
    {#each Array.from({length: 50 }) as _}
      <div
        class="particleTrail"
        style="
          left: {prng() * (32 + trailWidth) - trailWidth}em;
          top: {prng() * (0.8 - trailHeight)}em;
          animation-delay: -{prng() * 20}s
        "
      >
      </div>
    {/each}
  </div>
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
    transition: background-color 0.25s ease 0s;
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
    from { transform: translate(calc(-32em - var(--trail-width)), 0); }
    to { transform: translate(32em, 0); }
  }

  div.legend {
    height: 0.8em;
    position: relative;
    overflow: hidden;
    background: rgba(0,0,0,0.2);
  }

  div.legend.paused * {
    animation-play-state: paused;
  }

  div.particleTrail {
    width: var(--trail-width);
    height: var(--trail-height);
    border-radius: calc(var(--trail-height) / 2);
    background:
      linear-gradient(to right, transparent, rgba(255, 255, 255, 0.3));
    position: absolute;
    animation: slide 20s linear;
    animation-iteration-count: infinite;
  }

  span {
    font-size: 0.75rem;
    min-height: 1.25rem;

    display: block;
    text-align: center;
    border-top: 1px solid white;
  }
</style>
