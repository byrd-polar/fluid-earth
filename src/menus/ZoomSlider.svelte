<script>
  import Add32 from "carbon-icons-svelte/lib/Add32";
  import Subtract32 from "carbon-icons-svelte/lib/Subtract32";

  export let zoom;
</script>

<h2>Zoom Slider</h2>
<!--vertical default slider element -->
<div class="block-title">Zoom Slider Vertical</div>
<div id = "vertical-slider-block">
  <div class="item-cell width-auto flex-shrink-0">
    <Add32 />
  </div>
  <div style="height: 200px;" class="range-slider range-slider-init">
    <input
      type ="range"
      id="vertical-zoom-slider"
      min="1"
      max="5"
      bind:value={zoom}
      orient= "vertical"
    >
  </div>
  <div class="item-cell width-auto flex-shrink-0">
    <Subtract32 />
  </div>
</div>
<!--horizontal default slider element -->
<div class="block-title">Zoom Slider Horizontal</div>
<div class="horizontal-slider-block">
  <div class="item-cell width-auto flex-shrink-0" style = "float:left">
    <Subtract32 />
  </div>
  <div class="range-slider range-slider-init"style = "float:left">
    <input
      type="range"
      id="horizontal-zoom-slider"
      min="1"
      max="5"
      bind:value={zoom}
    >
  </div>
  <div class="item-cell width-auto flex-shrink-0"style = "float:left">
    <Add32 />
  </div>
</div>
<element class="paragraph">
  <p>Zoom in and out by moving the slider up and down or left and right</p>
</element>

<style>
  .paragraph p {
    padding: 50px 10px 50px 10px;
  }

  .block-title {
    width: 100%;
  }

  #horizontal-zoom-slider {
    -webkit-appearance: none;
    width: 200px;
    height: 15px;
    border-radius: 5px;
    background: #d3d3d3;
    outline: none;
    opacity: 0.7;
    -webkit-transition: .2s;
    transition: opacity .2s;
  }

  #vertical-zoom-slider {
    -webkit-appearance: none;
    width: 15px;
    height: 200px;
    border-radius: 10px;
    background: #d3d3d3;
    outline: none;
    opacity: 0.7;
    -webkit-transition: .2s;
    transition: opacity .2s;
  }
</style>
