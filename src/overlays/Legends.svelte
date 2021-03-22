<script>
  import GriddedLegend from '../components/GriddedLegend.svelte';
  import StreamlinesLegend from '../components/StreamlinesLegend.svelte';
  import tooltip from '../tooltip.js';
  import Calendar32 from "carbon-icons-svelte/lib/Calendar32";
  import Time32 from "carbon-icons-svelte/lib/Time32";
  import { fix24 } from '../utility.js';

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

  export let openedMenu;

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

  function toggleTimeMachineMenu() {
    if (openedMenu === "Time Machine") {
      openedMenu = null;
    } else {
      openedMenu = "Time Machine";
    }
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
      <div class="icon">
        <Calendar32 />
      </div>
      <div>
        <h3>{date.toLocaleDateString(undefined, dateOptions)}</h3>
      </div>
      <div class="icon">
        <Time32 />
      </div>
      <div>
        <h3>{fix24(date.toLocaleTimeString(undefined, timeOptions))}</h3>
      </div>
    </section>
  </div>
  <div class="bottom">
    {#if particlesShown}
      <StreamlinesLegend
        {particleDataset}
        {particleDisplay}
        bind:particlesPaused
      />
    {/if}
    <GriddedLegend
      {griddedDataset}
      {griddedColormap}
      {griddedDomain}
      bind:griddedUnit
      bind:preferredUnits
    />
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
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    pointer-events: auto;
    cursor: pointer;
  }

  section {
    cursor: pointer;
    border-radius: 4px;
    -webkit-tap-highlight-color: transparent;
    transition: background-color 0.25s ease 0s;
    display: flex;
  }

  section:focus, section:hover {
    background-color: var(--input-color);
    outline: none;
  }

  section:focus:not(:focus-visible):not(:hover) {
    background-color: inherit;
  }

  div.bottom {
    margin-top: auto;
    flex-wrap: wrap;
  }

  div.icon {
    padding-top: 0.25em;
  }

  h3 {
    width: max-content;
    align-self: end;
    text-align: right;
    font-size: 1.2em;
    padding: 0.25rem 0.75rem 0.25rem 0.5rem;
    margin: 0 0 0 auto;
    pointer-events: auto;
  }

  @media (max-width: 36rem) {
    div.bottom :global(h3) {
      font-size: 0.875em;
    }

    h3 {
      font-size: 1em;
      padding: 0.5rem 0.75rem;
    }

    div.icon {
      display: none;
    }
  }
</style>
