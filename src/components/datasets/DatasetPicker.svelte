<script>
  import ChipGroup from '../ChipGroup.svelte';
  import { tick } from 'svelte';

  import topicFilters from './topics.js';
  import variableFilters from './variables.js';
  import heightFilters from './heights.js';
  import animationFilters from './animations.js';
  import iconsMap from './iconsMap.js';

  export let date;
  export let gDatasets;
  export let pDatasets;
  export let griddedDataset;
  export let particleDataset;
  export let simplifiedMode;

  $: griddedNames = gDatasets.map(dataset => dataset.name);
  $: particleNames = pDatasets.map(dataset => dataset.name);

  $: tFilters =     topicFilters[simplifiedMode ? 'simple' : 'normal'];
  $: vFilters =  variableFilters[simplifiedMode ? 'simple' : 'normal'];
  $: hFilters =    heightFilters[simplifiedMode ? 'simple' : 'normal'];
  $: aFilters = animationFilters[simplifiedMode ? 'simple' : 'normal'];

  $: topics     = Object.keys(tFilters);
  $: variables  = Object.keys(vFilters);
  $: heights    = Object.keys(hFilters);
  $: animations = Object.keys(aFilters);

  let topic, variable, height, animation;

  let previousTopic;
  $: if (previousTopic !== topic) {
    if (animation !== 'none') {
      animation = (topic === 'ocean') ? 'currents' : 'wind';
    }
    previousTopic = topic;
  }
  $: update(griddedDataset, particleDataset, simplifiedMode);
  function update(griddedDataset, particleDataset, simplifiedMode) {
    topic     =     topics.find(c => tFilters[c](griddedDataset.name));
    variable  =  variables.find(v => vFilters[v](griddedDataset.name));
    height    =    heights.find(h => hFilters[h](griddedDataset.name));
    animation = animations.find(a => aFilters[a](particleDataset.name));
  }
  $: gDataset = gDatasets.find(d => {
    return tFilters[topic](d.name)
        && vFilters[variable](d.name)
        && hFilters[height](d.name);
  });
  $: pDataset = pDatasets.find(d => {
    return aFilters[animation](d.name)
        && (hFilters[height](d.name) || d.name === 'none');
  });
  $: topicOptions = topics.filter(t => t !== 'undefined');
  $: variableOptions = variables.filter(v => {
    let names = griddedNames.filter(tFilters[topic]);
    return names.find(name => vFilters[v](name));
  });
  $: heightOptions = heights.filter(h => {
    let names = griddedNames.filter(vFilters[variable]);
    return names.find(name => hFilters[h](name));
  });
  $: animationOptions = topic === 'climate'
    ? ['none']
    : animations.filter(a => {
    let datasets = pDatasets
      .filter(d => hFilters[height](d.name) || d.name === 'none');
    return datasets.find(d => {
      return aFilters[a](d.name)
          && gDataset
          && d.isCloseDate(gDataset.closestValidDate(date));
    });
  });

  async function handleSelect() {
    await tick();
    await autoSelect();
    updateDatasets();
  }
  async function autoSelect() {
    if (!variableOptions.includes(variable)) variable = variableOptions[0];
    await tick();
    if (!heightOptions.includes(height)) height = heightOptions[0];
    await tick();
    if (!animationOptions.includes(animation)) animation = animationOptions[0];
  }
  function updateDatasets() {
    if (gDataset && griddedDataset !== gDataset) griddedDataset = gDataset;
    if (pDataset && particleDataset !== pDataset) particleDataset = pDataset;
  }
</script>

<h3>Topic</h3>
<ChipGroup
  options={topicOptions}
  bind:selected={topic}
  on:select={handleSelect}
  {iconsMap}
/>

<h3>Variable</h3>
<ChipGroup
  options={variableOptions}
  bind:selected={variable}
  on:select={handleSelect}
  {iconsMap}
/>

<h3>Height</h3>
<ChipGroup
  options={heightOptions}
  bind:selected={height}
  on:select={handleSelect}
  {iconsMap}
/>

<h3>Animation</h3>
<ChipGroup
  options={animationOptions}
  bind:selected={animation}
  on:select={handleSelect}
  {iconsMap}
/>

<style>
  h3 {
    margin: 0.5em 0 0.25em;
    font-size: 1em;
  }
</style>
