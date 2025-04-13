<script>
  import colormaps, { types } from '../map/colormaps/';
  import projections from '../map/projections/';
  import { uniqueId } from '../utility.js';

  export let gDatasets;
  export let pDatasets;
  export let griddedDataset;
  export let particleDataset;
  export let griddedColormap;

  export let projection;

  const griddedRadioName = uniqueId();
  const particleRadioName = uniqueId();
  const colormapRadioName = uniqueId();
  const projectionRadioName = uniqueId();
</script>

<details open>
<summary><h2>Note about this menu</h2></summary>
<p>
This menu does not exist in the production build. It is used as a debugging tool
when adding new datasets/colormaps/projections and for experimenting with new
user interface components.
</details>

<details>
<summary><h2>All Datasets</h2></summary>
<h3>Gridded</h3>
{#each gDatasets as dataset}
  <label>
    <input
      type="radio"
      name={griddedRadioName}
      bind:group={griddedDataset}
      value={dataset}
    >
    {dataset.name}
  </label>
{/each}

<h3>Particle</h3>
{#each pDatasets as dataset}
  <label>
    <input
      type="radio"
      name={particleRadioName}
      bind:group={particleDataset}
      value={dataset}
    >
    {dataset.name}
  </label>
{/each}
</details>

<details>
<summary><h2>About colormaps</h2></summary>
<p>
Colormaps define how numerical values are converted to colors to display on the
map.
<p>
Perceptions of data are heavily influenced by the choice of colormap, so it is
important for science communicators to select an appropriate colormap for their
data. Toggle between the colormaps below to see how the same data looks when
presented with different colors.
</details>

<details>
<summary><h2>All colormaps</h2></summary>
{#each [...types] as type}
  <h3>{type}</h3>

  {#each Object.values(colormaps).filter(map => map.type === type) as map}
    <label>
      <input
        type="radio"
        name={colormapRadioName}
        bind:group={griddedColormap}
        value={map}
      >
      {map.name}
    </label>
  {/each}
{/each}
</details>

<details>
<summary><h2>About projections</h2></summary>
<p>
Map projections are the various ways of taking a three-dimensional globe and
projecting it to the two-dimensional surface of a map.
<p>
This will always distort the globe in some way, so each projection has its
tradeoffs and use cases.
</details>

<details>
<summary><h2>All projections</h2></summary>
{#each Object.values(projections) as p}
<label>
  <input
    type="radio"
    name={projectionRadioName}
    bind:group={projection}
    value={p}
  >
  {p.name}
</label>
{/each}
</details>

<style>
  label {
    padding: 0.25em 0;
    display: block;
    cursor: pointer;
  }

  label:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }

  h3 {
    margin: 1em 0 0.25em;
    font-size: 1em;
  }

  input {
    accent-color: var(--primary-color-light);
  }
</style>
