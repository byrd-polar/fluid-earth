<script>
  import GriddedLegend from '../components/GriddedLegend.svelte';
  import StreamlinesLegend from '../components/StreamlinesLegend.svelte';

  export let date;

  export let particlesShown;
  export let particleDataset;
  export let particleDisplay;

  export let griddedDataset;
  export let griddedColormap;
  export let griddedDomain;
  export let griddedUnit;
  export let preferredUnits;

  const dateOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  const timeOptions = {
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short',
  };
</script>

<div class="wrapper">
  <div class="top">
    <h3 class="date">{date.toLocaleDateString(undefined, dateOptions)}</h3>
    <h3 class="time">{date.toLocaleTimeString(undefined, timeOptions)}</h3>
  </div>
  <div class="bottom">
    <GriddedLegend
      {griddedDataset}
      {griddedColormap}
      {griddedDomain}
      bind:griddedUnit
      bind:preferredUnits
    />
    {#if particlesShown}
      <StreamlinesLegend
        {particleDataset}
        {particleDisplay}
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

  h3 {
    text-align: right;
    font-size: 1.2em;
    padding: 0.25rem 0.75rem 0;
    margin: 0;
    pointer-events: auto;
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
    }

    h3.date {
      padding: 0.75rem 0.75rem 0;
    }
  }
</style>
