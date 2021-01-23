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
  <h3>
    {date.toLocaleDateString(undefined, dateStringOptions)}
  </h3>
  <div>
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

  div.wrapper {
    display: flex;
    flex-direction: column;
    color: white;
    pointer-events: none;
  }

  div.wrapper > * {
    pointer-events: auto;
    user-select: none;
  }

  h3 {
    text-align: right;
    font-size: 1.2em;
    margin: 0.25rem 0.75rem;
  }

  div.wrapper > div {
    margin-top: auto;
    display: flex;
    flex-wrap: wrap;
  }

  @media (max-width: 36rem) {
    div :global(h3) {
      font-size: 0.875em;
    }

    h3 {
      /* height of nav rail (top plus bottom padding plus icon height) plus
       * original margin */
      margin-top: calc(48px + 1.25rem);
      font-size: 1em;
      text-align: center;
    }
  }
</style>
