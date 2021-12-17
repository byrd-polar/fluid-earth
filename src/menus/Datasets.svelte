<script>
  import ChipGroup from '../components/ChipGroup.svelte';
  import { validDate, validCloseDate } from '../utility.js';
  import { tick } from 'svelte';

  import topicFilters from './filters/topics.js';
  import variableFilters from './filters/variables.js';
  import heightFilters from './filters/heights.js';
  import animationFilters from './filters/animations.js';
  import iconsMap from './filters/iconsMap.js';

  export let date;
  export let inventory;
  export let griddedDataset;
  export let particleDataset;
  export let particlesShown;
  export let simplifiedMode;

  let griddedDatasets = inventory.filter(d => d.colormap)
  let particleDatasets = inventory.filter(d => d.particleDisplay);
  let griddedNames = griddedDatasets.map(dataset => dataset.name);
  let particleNames = particleDatasets.map(dataset => dataset.name);

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
  $: update(griddedDataset, particleDataset, particlesShown, simplifiedMode);
  function update(
    griddedDataset, particleDataset, particlesShown, simplifiedMode
  ) {
    topic     =     topics.find(c => tFilters[c](griddedDataset.name));
    variable  =  variables.find(v => vFilters[v](griddedDataset.name));
    height    =    heights.find(h => hFilters[h](griddedDataset.name));
    animation = animations.find(a => aFilters[a](
      particlesShown ? particleDataset.name : ''
    ));
  }
  $: gDataset = griddedDatasets.find(d => {
    return tFilters[topic](d.name)
        && vFilters[variable](d.name)
        && hFilters[height](d.name);
  });
  $: pDataset = particleDatasets.find(d => {
    return aFilters[animation](d.name)
        && hFilters[height](d.name);
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
  $: animationOptions = animations.filter(a => {
    if (a === 'none') return true;

    let datasets = particleDatasets.filter(d => hFilters[height](d.name));
    return datasets.find(d => aFilters[a](d.name)
        && gDataset
        && validCloseDate(d, validDate(gDataset, date)));
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
    particlesShown = (animation !== 'none');
  }
</script>

<h2>Filter by</h2>

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
    margin: 1em 0 0.25em;
    font-size: 1em;
  }
</style>
