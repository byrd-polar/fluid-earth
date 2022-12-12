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
  1991-2020, e.g. all the months of August during 1991-2020.
<p><b>Permafrost zones</b> are numbered from 1 to 4 based on how much of the
  ground is covered by permafrost:
  <ol>
    <li>Isolated patches (0 - 10% coverage)</li>
    <li>Sporadic permafrost (10 - 50% coverage)</li>
    <li>Discontinuous permafrost (50 - 90% coverage)</li>
    <li>Continuous permafrost (>90% coverage)</li>
  </ol>
</details>
