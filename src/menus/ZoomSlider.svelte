<script>
  import Add32 from "carbon-icons-svelte/lib/Add32";
  import Subtract32 from "carbon-icons-svelte/lib/Subtract32";
  import RangeSlider from 'svelte-range-slider-pips';

  export let minZoom;
  export let maxZoom;
  export let zoom;

  const step = 0.1;
  const springValues = { stiffness: 0.15, damping: 1 };
</script>

<h2>Vertical</h2>
<div class="vertical">
  <Subtract32 />
  <RangeSlider
    bind:value={zoom}
    min={minZoom}
    max={maxZoom}
    {step}
    {springValues}
    vertical
    float
  />
  <Add32 />
</div>

<h2>Horizontal</h2>
<div class="horizontal">
  <Subtract32 />
  <RangeSlider
    bind:value={zoom}
    min={minZoom}
    max={maxZoom}
    {step}
    {springValues}
    float
  />
  <Add32 />
</div>

<p>Zoom in and out by moving the slider up and down or left and right.</p>

<style>
  div {
    display: flex;
    align-items: center;
  }

  div.horizontal {
    flex-direction: row;
  }

  div.vertical {
    flex-direction: column;
    width: min-content;
  }

  :global(div.horizontal :nth-child(2), div.vertical :nth-child(2)) {
    flex: 1;
  }
</style>
