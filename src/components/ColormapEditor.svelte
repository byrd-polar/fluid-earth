<script>
  import RangeSlider from 'svelte-range-slider-pips';

  export let displayedGriddedDataset;
  export let griddedColormap;
  export let griddedDomain;
  export let griddedScale;
</script>

<RangeSlider
  bind:values={griddedDomain}
  min={displayedGriddedDataset.domain[0]}
  max={displayedGriddedDataset.domain[1]}
  springValues={{ stiffness: 1, damping: 1 }}
  --range-range="var(--primary-color-light)"
  --range-pip="gray"
  --range-pip-active="gray"
  range float pips
/>
