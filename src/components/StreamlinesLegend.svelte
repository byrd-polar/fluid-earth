<script>
  import { capitalizeFirstLetter, handleLikeButton } from '../utility.js';
  import tooltip from '../tooltip.js';
  import { prng_alea } from 'esm-seedrandom/esm/'

  export let particleName;
  export let particleDisplay;
  export let particlesPaused;

  function togglePaused() {
    particlesPaused = !particlesPaused;
  }

  let prng = prng_alea('Milankovitch');

  const trailCount = 20;
  const trailWidth = 5;
  const trailHeight = 0.3;
  const trailPeriod = 15;
</script>

<section
  on:click={togglePaused}
  on:keydown={handleLikeButton(togglePaused)}
  use:tooltip={{ content: 'Pause/play animation', placement: 'top'}}
  role="button"
  tabindex="0"
>
  <h3>{capitalizeFirstLetter(particleName)}</h3>
  <div
    class="legend"
    class:paused={particlesPaused}
    style="
      --trail-width: {trailWidth}em;
      --trail-height: {trailHeight}em;
      --trail-period: {trailPeriod}s;
      --trail-color: rgba(255, 255, 255, {particleDisplay.opacity});
    "
  >
    {#each Array.from({length: trailCount }) as _}
      <div
        class="particleTrail"
        style="
          top: {prng() * (0.8 - trailHeight)}em;
          animation-delay: -{prng() * trailPeriod}s;
        "
      >
      </div>
    {/each}
  </div>
  <span>
    {#if particlesPaused}
      particle animation paused
    {:else}
      {particleDisplay.rate.toLocaleString()} times faster than actual
    {/if}
  </span>
</section>

<style>
  section {
    flex: 1;
    padding: 4px 12px;
    max-width: 512px;
    flex-basis: 384px;
    pointer-events: auto;
    border-radius: 4px;
    transition: background-color 0.25s ease 0s;
    cursor: pointer;

    margin-left: auto;
    margin-top: auto;
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
    from { transform: translate(calc(-1 * var(--trail-width)), 0); }
    to { transform: translate(512px, 0); }
  }

  div.legend {
    height: 13px;
    position: relative;
    overflow: hidden;
  }

  div.legend.paused * {
    animation-play-state: paused;
  }

  div.particleTrail {
    width: var(--trail-width);
    height: var(--trail-height);
    border-radius: calc(var(--trail-height) / 2);
    background:
      linear-gradient(to right, transparent, var(--trail-color));
    position: absolute;
    animation: slide var(--trail-period) linear;
    animation-iteration-count: infinite;
  }

  span {
    font-size: 0.75rem;
    height: 1.5rem;

    display: flex;
    justify-content: center;
    align-items: center;
    border-top: 1px solid white;
  }
</style>
