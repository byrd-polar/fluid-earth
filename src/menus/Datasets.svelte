<script>
  import DatasetPicker from '../components/datasets/DatasetPicker.svelte';
  import DatasetInfo from '../components/datasets/DatasetInfo.svelte';

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
<summary><h2>About the selected dataset</h2></summary>
<DatasetInfo
  {griddedDataset}
/>
</details>


