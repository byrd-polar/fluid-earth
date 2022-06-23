<script>
  import Notification from '../components/Notification.svelte';
  import TimeDisplay from '../components/TimeDisplay.svelte';
  import SideControls from '../components/SideControls.svelte';
  import GriddedLegend from '../components/GriddedLegend.svelte';
  import StreamlinesLegend from '../components/StreamlinesLegend.svelte';
  import SimpleStreamLegend from '../components/SimpleStreamlinesLegend.svelte';
  import { mobile } from '../stores.js';

  export let openedMenu;

  export let displayDate;
  export let utc;

  export let zoom;
  export let minZoom;
  export let maxZoom;

  export let particleName;
  export let particleDisplay;

  export let griddedName;
  export let griddedColormap;
  export let griddedDomain;
  export let griddedScale;
  export let griddedData;
  export let griddedUnit;

  export let preferredUnits;
  export let particlesPaused;

  export let simplifiedMode;
  export let kioskMode;
</script>

<div class="wrapper">
  <div class="top" >
    <Notification
      bind:openedMenu
      {kioskMode}
    />
    <TimeDisplay
      {displayDate}
      bind:utc
    />
  </div>
  {#if !$mobile}
    <SideControls
      bind:zoom
      {minZoom}
      {maxZoom}
    />
  {/if}
  <div class="bottom">
    {#if griddedName !== 'none'}
      <GriddedLegend
        {griddedName}
        {griddedColormap}
        {griddedDomain}
        {griddedScale}
        griddedOriginalUnit={griddedData.originalUnit}
        bind:griddedUnit
        {preferredUnits}
        {simplifiedMode}
      />
    {/if}
    {#if particleName !== 'none'}
      {#if simplifiedMode}
        <SimpleStreamLegend
          {particleName}
          bind:particlesPaused
        />
      {:else}
        <StreamlinesLegend
          {particleName}
          {particleDisplay}
          bind:particlesPaused
        />
      {/if}
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
    justify-content: space-between;
    color: white;
    pointer-events: none;
    user-select: none;
  }

  div.top {
    align-items: flex-start;
    justify-content: end;
  }

  div.bottom {
    flex-wrap: wrap-reverse;
  }

  @media (max-width: 576px) {
    div.top {
      flex-wrap: wrap-reverse;
      align-items: flex-end;
    }

    div.bottom :global(h3) {
      font-size: 0.875em;
    }
  }
</style>
