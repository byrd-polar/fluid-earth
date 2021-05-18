<script>
  import ChipGroup from '../components/ChipGroup.svelte';
  import { validDate } from '../utility.js';
  import { tick } from 'svelte';
  import {
    categoryFilters,
    propertyFilters,
    levelFilters,
    animationFilters,
  } from './datasetFilters.js';

  export let date;
  export let inventory;
  export let MAX_TEXTURE_SIZE;
  export let griddedDataset;
  export let particleDataset;
  export let particlesShown;
  export let advancedOptions;

  let griddedDatasets = inventory.filter(d => d.colormap)
  let particleDatasets = inventory.filter(d => d.particleDisplay);
  let griddedNames = griddedDatasets.map(dataset => dataset.name);

  let categories = Object.keys(categoryFilters);
  let properties = Object.keys(propertyFilters);
  let levels = Object.keys(levelFilters);
  let animations = Object.keys(animationFilters);

  let category;
  let property;
  let level;
  let animation;

  $: griddedDataset, particlesShown, updateFilterSelections();

  function updateFilterSelections() {
    category = categories.find(c => categoryFilters[c](griddedDataset.name));
    property = properties.find(p => propertyFilters[p](griddedDataset.name));
    level = levels.find(l => levelFilters[l](griddedDataset.name));
    animation = particlesShown ?
      animations.find(a => animationFilters[a](particleDataset.name)) : 'none';
  }

  $: categoryOptions = categories.filter(key => key !== 'undefined');
  $: propertyOptions = properties.filter(key => {
    return griddedNames.filter(categoryFilters[category]).find(name => {
      return propertyFilters[key](name);
    });
  });
  $: levelOptions = levels.filter(key => {
    return griddedNames.filter(propertyFilters[property]).find(name => {
      return levelFilters[key](name);
    });
  });
  $: animationOptions = animations.filter(key => {
    if (key === 'none') return true;

    return particleDatasets.filter(d => levelFilters[level](d.name)).find(d => {
      return animationFilters[key](d.name) &&
             validDate(particleDataset, date).getTime() === date.getTime();
    });
  });

  $: if (!propertyOptions.includes(property)) property = propertyOptions[0];
  $: if (!levelOptions.includes(level)) level = levelOptions[0];

  async function updateDatasets(e) {
    await tick();

    let gCandidate = griddedDatasets.find(d => {
      return categoryFilters[category](d.name) &&
             propertyFilters[property](d.name) &&
             levelFilters[level](d.name);
    });
    if (gCandidate) {
      griddedDataset = gCandidate;
    }

    if (animation === 'none') {
      particlesShown = false;
      return;
    } else {
      particlesShown = true;
    }
    let pCandidate = particleDatasets.find(d => {
      return animationFilters[animation](d.name) &&
             levelFilters[level](d.name);
    });
    if (pCandidate) {
      particleDataset = pCandidate;
    }
  }
</script>

<h2>Filters</h2>

<h3>Category</h3>
<ChipGroup
  options={categoryOptions}
  bind:selected={category}
  on:select={updateDatasets}
/>

<h3>Property</h3>
<ChipGroup
  options={propertyOptions}
  bind:selected={property}
  on:select={updateDatasets}
/>

<h3>Level</h3>
<ChipGroup
  options={levelOptions}
  bind:selected={level}
  on:select={updateDatasets}
/>

<h3>Animation</h3>
<ChipGroup
  options={animationOptions}
  bind:selected={animation}
  on:select={updateDatasets}
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
