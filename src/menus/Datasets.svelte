<script>
  import ChipGroup from '../components/ChipGroup.svelte';
  import Toggle from 'svelte-toggle';
  import {
    categoryFilters,
    propertyFilters,
    levelFilters,
  } from './datasetFilters.js';

  export let inventory;
  export let MAX_TEXTURE_SIZE;
  export let griddedDataset;
  export let particleDataset;
  export let particlesShown;
  export let advancedOptions;

  let griddedDatasets = inventory.filter(d => d.colormap)
  let particleDatasets = inventory.filter(d => d.particleDisplay);
  let datasetNames = griddedDatasets.map(dataset => dataset.name);

  let categories = Object.keys(categoryFilters);
  let properties = Object.keys(propertyFilters);
  let levels = Object.keys(levelFilters);

  let category;
  let property;
  let level;

  $: griddedDataset, updateFilterSelections();

  function updateFilterSelections() {
    category = categories.find(c => categoryFilters[c](griddedDataset.name));
    property = properties.find(p => propertyFilters[p](griddedDataset.name));
    level = levels.find(l => levelFilters[l](griddedDataset.name));
  }

  $: categoryOptions = categories.filter(key => key !== 'undefined');
  $: propertyOptions = properties.filter(key => {
    return datasetNames.filter(categoryFilters[category]).find(name => {
      return propertyFilters[key](name);
    });
  });
  $: levelOptions = levels.filter(key => {
    return datasetNames.filter(propertyFilters[property]).find(name => {
      return levelFilters[key](name);
    });
  });

  $: if (!propertyOptions.includes(property)) property = propertyOptions[0];
  $: if (!levelOptions.includes(level)) level = levelOptions[0];

  $: category, property, level, updateDatasets();

  function updateDatasets() {
    let gCandidate = inventory.filter(d => d.colormap).find(d => {
      return categoryFilters[category](d.name) &&
             propertyFilters[property](d.name) &&
             levelFilters[level](d.name);
    });
    if (gCandidate) {
      griddedDataset = gCandidate;
    }
    let pCandidate = inventory.filter(d => d.particleDisplay).find(d => {
      return categoryFilters[category](d.name) &&
             levelFilters[level](d.name);
    });
    if (!pCandidate) {
      pCandidate = inventory.filter(d => d.particleDisplay).find(d => {
        return levelFilters[level](d.name);
      });
    }
    if (!pCandidate && level === 'total column') {
      pCandidate = inventory.filter(d => d.particleDisplay).find(d => {
        return levelFilters['500 mb (cloud)'](d.name);
      });
    }
    if (pCandidate) {
      particleDataset = pCandidate;
    } else {
      particlesShown = false;
    }
  }
</script>

<h2>Filters</h2>

<h3>Category</h3>
<ChipGroup options={categoryOptions} bind:selected={category}/>

<h3>Property</h3>
<ChipGroup options={propertyOptions} bind:selected={property}/>


<h3>Level</h3>
<ChipGroup options={levelOptions} bind:selected={level}/>

<h2>Settings</h2>

<Toggle
  bind:toggled={particlesShown}
  label="streamlines"
  toggledColor="var(--secondary-color)"
  on="particle animation enabled"
  off="particle animation disabled"
  style="order: 2; margin-left: auto"
/>

{#if advancedOptions}
  <h2>All Datasets</h2>

  <h3>Gridded</h3>
  {#each griddedDatasets as dataset}
    <label>
      <input
        type="radio"
        name="griddedDataset"
        bind:group={griddedDataset}
        value={dataset}
        disabled={Math.max(dataset.width, dataset.height) > MAX_TEXTURE_SIZE}
      >
      {dataset.name}
    </label>
  {/each}

  <h3>Particle</h3>
  {#each particleDatasets as dataset}
    <label>
      <input
        type="radio"
        name="particleDataset"
        bind:group={particleDataset}
        value={dataset}
        disabled={Math.max(dataset.width, dataset.height) > MAX_TEXTURE_SIZE}
      >
      {dataset.name}
    </label>
  {/each}
{/if}

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
</style>
