<script>
  import DatasetPicker from '../components/datasets/DatasetPicker.svelte';
  import ColormapEditor from '../components/ColormapEditor.svelte';

  export let date;
  export let gDatasets;
  export let pDatasets;
  export let griddedDataset;
  export let particleDataset;
  export let simplifiedMode;
  export let displayedGriddedDataset;
  export let griddedColormap;
  export let griddedDomain;
  export let griddedScale;
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
<summary><h2>Colormap Editor</h2></summary>
<ColormapEditor
  {displayedGriddedDataset}
  bind:griddedColormap
  bind:griddedDomain
  bind:griddedScale
/>
</details>
