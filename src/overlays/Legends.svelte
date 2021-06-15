<script>
  import GriddedLegend from '../components/GriddedLegend.svelte';
  import StreamlinesLegend from '../components/StreamlinesLegend.svelte';
  import tooltip from '../tooltip.js';
  import { validUnit, fix24 } from '../utility.js';

  export let date;
  export let utc;

  export let particlesShown;
  export let particleDataset;
  export let particleDisplay;

  export let griddedDataset;
  export let griddedColormap;
  export let griddedDomain;
  export let griddedUnit;

  export let preferredUnits;
  export let particlesPaused;

  export let simplifiedMode;

  $: dateOptions = {
    timeZone: utc ? 'UTC' : undefined,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  $: timeOptions = {
    timeZone: utc ? 'UTC' : undefined,
    hour12: utc ? false : undefined,
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short',
  };

  function handleKeydown(e) {
    if (!(e.code === 'Space' || e.code === 'Enter')) return;

    utc = !utc
  }

  // Update the legends when datasets change instead of waiting for when the
  // data has been fully downloaded. Requires that the variables being updated
  // in the `eagerlyUpdate` function are NOT bound to the Legends component.

  $: griddedDataset, eagerlyUpdateGriddedLegend();
  $: particleDataset, eagerlyUpdateParticleLegend();

  function eagerlyUpdateGriddedLegend() {
    griddedColormap = griddedDataset.colormap;
    griddedDomain = griddedDataset.domain;
    griddedUnit = griddedDataset.unit;
    griddedUnit = validUnit(griddedDataset.unit, preferredUnits);
  }

  function eagerlyUpdateParticleLegend() {
    particleDisplay = particleDataset.particleDisplay;
  }
</script>

<div class="wrapper">
  <div class="top" >
    <section
      on:click={() => utc = !utc}
      on:keydown={handleKeydown}
      use:tooltip={{ content: 'Change timezone', placement: 'bottom'}}
      tabindex="0"
    >
      <h3 class="date">{date.toLocaleDateString(undefined, dateOptions)}</h3>
      <h3 class="time">
        {fix24(date.toLocaleTimeString(undefined, timeOptions))}
      </h3>
    </section>
  </div>
  <div class="bottom">
    <GriddedLegend
      name={griddedDataset.name}
      originalUnit={griddedDataset.originalUnit}
      {griddedColormap}
      {griddedDomain}
      {griddedUnit}
      bind:preferredUnits
      {simplifiedMode}
    />
    {#if particlesShown}
      <StreamlinesLegend
        name={particleDataset.name}
        {particleDisplay}
        bind:particlesPaused
        {simplifiedMode}
      />
    {/if}
  </div>
</div>

<style>
  div :global(h3),
  div :global(svg),
  div :global(span) {
    /* multiple comma-separated shadows used to increase intensity */
    text-shadow:
      0 0 0.25em black,
      0 0 0.5em black,
      0 0 1em black;
  }

  div {
    display: flex;
  }

  div.wrapper {
    flex-direction: column;
    color: white;
    pointer-events: none;
    user-select: none;
  }

  div.top {
    flex-direction: column;
    align-items: flex-end;
  }

  section {
    cursor: pointer;
    border-radius: 4px;
    -webkit-tap-highlight-color: transparent;
    transition: background-color 0.25s ease 0s;
  }

  section:focus, section:hover {
    background-color: var(--input-color);
    outline: none;
  }

  section:focus:not(:focus-visible):not(:hover) {
    background-color: inherit;
  }

  h3 {
    text-align: right;
    font-size: 1.2em;
    padding: 0.25rem 0.75rem 0;
    margin: 0;
    pointer-events: auto;
    z-index: 1;
  }

  h3.time {
    padding-top: 0;
    font-weight: normal;
  }

  div.bottom {
    margin-top: auto;
    flex-wrap: wrap-reverse;
  }

  @media (max-width: 36rem) {
    div.bottom :global(h3) {
      font-size: 0.875em;
    }

    h3 {
      font-size: 1em;
      padding: 0.5rem 0.75rem;
    }

    h3.date {
      padding: 0.5rem 0.75rem 0;
    }
  }
</style>
