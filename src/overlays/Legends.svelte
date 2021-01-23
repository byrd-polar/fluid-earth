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

  let dateStringOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short',
  };
</script>

<div class="wrapper">
  <div class="top">
    <h3>{date.toLocaleDateString(undefined, dateStringOptions)}</h3>
  </div>
  <div class="bottom">
    {#if particlesShown}
      <StreamlinesLegend
        {particleDataset}
        {particleDisplay}
      />
    {/if}
    <GriddedLegend
      {griddedDataset}
      {griddedColormap}
      {griddedDomain}
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

  h3 {
    width: max-content;
    align-self: end;
    font-size: 1.2em;
    padding: 0.25rem 0.75rem;
    margin: 0 0 0 auto;
    pointer-events: auto;
  }

  div.bottom {
    margin-top: auto;
    flex-wrap: wrap;
  }

  @media (max-width: 36rem) {
    div.bottom :global(h3) {
      font-size: 0.875em;
    }

    h3 {
      /* height of nav rail (top plus bottom padding plus icon height) */
      margin: calc(48px + 1rem) auto 0;
      font-size: 1em;
    }
  }
</style>
