<script>
  export let griddedDataset;
  $: info = infoByName(griddedDataset.name);

  function infoByName(name) {
    switch(name) {
      case 'average temperature at 2 m above ground':
      case 'average precipitation per day':
        return 'climate_averages';
      case 'average temperature at 2 m above ground anomaly':
      case 'average precipitation per day anomaly':
        return 'climate_anomolies';
      case 'permafrost probability':
      case 'permafrost probability [low resolution]':
        return 'permafrost_prob';
      case 'ocean surface currents speed':
        return 'oscar';
      default:
        return 'default';
    }
  }
</script>

{#if info === 'climate_averages'}
  <p>Climate averages (<b>avg.</b>) are over a monthly period.</p>
{:else if info === 'climate_anomolies'}
  <p>The <b>anomaly</b> is the difference between the average for a specific
    month, e.g. August 2022, compared to an average over that same month from
    1991–2020, e.g. all the months of August during 1991–2020.</p>
{:else if info === 'permafrost_prob'}
  <p><b>Permafrost probability</b> is how likely that the average annual ground
    temperature is below 0&nbsp;°C. Based on this value, permafrost zones are
    classified as follows:
  <dl>
    <dt>&gt;0–10%<dd>isolated patches
    <dt>&gt;10–50%<dd>sporadic
    <dt>&gt;50–90%<dd>discontinuous
    <dt>&gt;90–100%<dd>continuous
  </dl>
{:else if info === 'oscar'}
  <p><b>Ocean current</b> values are averaged over the UTC day and over the top
    30 meters of the <a href="https://en.wikipedia.org/wiki/Mixed_layer">mixed
    layer</a>.</p>
{:else if info === 'default'}
  <p class="italics">No additional information for this dataset.</p>
{/if}

<style>
  dl {
    display: grid;
    grid-template-columns: max-content 1fr;
  }

  dt {
    font-weight: bold;
    text-align: right;
    grid-column: 1;
  }

  dd {
    grid-column: 2;
    margin-left: 1.5em;
  }

  p.italics {
    font-style: italic;
  }
</style>
