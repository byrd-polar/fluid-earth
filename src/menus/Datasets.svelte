<script>
  import DatasetPicker from '../components/datasets/DatasetPicker.svelte';

  export let date;
  export let gDatasets;
  export let pDatasets;
  export let griddedDataset;
  export let particleDataset;
  export let simplifiedMode;
</script>

<details open>
<summary><h2>Dataset Picker</h2></summary>
<DatasetPicker
  {date}
  {gDatasets}
  {pDatasets}
  bind:griddedDataset
  bind:particleDataset
  {simplifiedMode}
/>
</details>
<details open>
<summary><h2>Climate Information</h2></summary>
<p>Temperature and precipitation averages (<b>avg.</b>) are over a monthly
  period.
<p>The <b>anomaly</b> is the difference between the average for a specific
  month, e.g. August 2022, compared to an average over that same month from
  1991–2020, e.g. all the months of August during 1991–2020.

<p><b>Permafrost probability</b> is how likely that the average annual ground
  temperature is below 0&nbsp;°C. Based on this value, permafrost zones are
  classified as follows:
  <dl>
    <dt>&gt;0–10%<dd>isolated patches
    <dt>&gt;10–50%<dd>sporadic
    <dt>&gt;50–90%<dd>discontinuous
    <dt>&gt;90–100%<dd>continuous
  </dl>
</details>

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
</style>
