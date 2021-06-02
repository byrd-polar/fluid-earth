<script>
  import ChipGroup from '../components/ChipGroup.svelte';
  import { validDate } from '../utility.js';
  import { tick } from 'svelte';
  import {
    categoryFilters,
    propertyFilters,
    basicLevelFilters,
    advancedLevelFilters,
    animationFilters,
  } from './datasetFilters.js';

  export let date;
  export let inventory;
  export let griddedDataset;
  export let particleDataset;
  export let particlesShown;
  export let advancedOptions;

  let griddedDatasets = inventory.filter(d => d.colormap)
  let particleDatasets = inventory.filter(d => d.particleDisplay);
  let griddedNames = griddedDatasets.map(dataset => dataset.name);

  $: levelFilters = advancedOptions ? advancedLevelFilters : basicLevelFilters;

  let categories = Object.keys(categoryFilters);
  let properties = Object.keys(propertyFilters);
  $: levels = Object.keys(levelFilters);
  let animations = Object.keys(animationFilters);

  let category;
  let property;
  let level;
  let animation;

  $: griddedDataset, particlesShown, advancedOptions, updateFilterSelections();

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

    return particleDatasets.find(d => {
      return animationFilters[key](d.name) &&
             validDate(d, date).getTime() === date.getTime();
    });
  });

  // Set sub-filter to first option if there are no matching options after
  // switching main filter. For example, if `propery` changes and the new
  // property's `levelOptions` does not include the current `level`, set `level`
  // to the first of these options.
  let previousCategory, previousProperty;
  $: {
    if (category !== previousCategory && !propertyOptions.includes(property)) {
      property = propertyOptions[0];
    }
    previousCategory = category;
  }
  $: {
    if (property !== previousProperty && !levelOptions.includes(level)) {
      level = levelOptions[0];
    }
    previousProperty = property;
  }

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

    particlesShown = (animation !== 'none');

    let pCandidate = particleDatasets.find(d => {
      return animationFilters[animation](d.name) &&
             levelFilters[level](d.name);
    });
    if (pCandidate && pCandidate !== particleDataset) {
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

<style>
  h3 {
    margin: 1em 0 0.25em;
    font-size: 1em;
  }
</style>
