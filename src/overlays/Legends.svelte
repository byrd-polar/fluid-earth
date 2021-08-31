<script>
  import TimeDisplay from '../components/TimeDisplay.svelte';
  import GriddedLegend from '../components/GriddedLegend.svelte';
  import StreamlinesLegend from '../components/StreamlinesLegend.svelte';
  import SimpleStreamLegend from '../components/SimpleStreamlinesLegend.svelte';

  export let date;
  export let utc;

  export let particleName;
  export let particlesShown;
  export let particleDisplay;

  export let griddedName;
  export let griddedColormap;
  export let griddedDomain;
  export let griddedScale;
  export let griddedOriginalUnit;
  export let griddedUnit;

  export let preferredUnits;
  export let particlesPaused;

  export let simplifiedMode;
</script>

<div class="wrapper">
  <div class="top" >
    <TimeDisplay
      {date}
      bind:utc
    />
  </div>
  <div class="bottom">
    <GriddedLegend
      {griddedName}
      {griddedColormap}
      {griddedDomain}
      {griddedScale}
      {griddedUnit}
      {griddedOriginalUnit}
      bind:preferredUnits
      {simplifiedMode}
    />
    {#if particlesShown}
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
    color: white;
    pointer-events: none;
    user-select: none;
  }

  div.top {
    flex-direction: column;
    align-items: flex-end;
  }

  div.bottom {
    margin-top: auto;
    flex-wrap: wrap-reverse;
  }

  @media (max-width: 36rem) {
    div.bottom :global(h3) {
      font-size: 0.875em;
    }
  }
</style>
