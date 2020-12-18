<script>
  import Add32 from "carbon-icons-svelte/lib/Add32";
  import Subtract32 from "carbon-icons-svelte/lib/Subtract32";
  import CaretLeftGlyph from "carbon-icons-svelte/lib/CaretLeftGlyph";
  import CaretRightGlyph from "carbon-icons-svelte/lib/CaretRightGlyph";
  import CaretUpGlyph from "carbon-icons-svelte/lib/CaretUpGlyph";
  import CaretDownGlyph from "carbon-icons-svelte/lib/CaretDownGlyph";
  import RangeSlider from 'svelte-range-slider-pips';
  import Button, { Group, Label } from '@smui/button';

  export let minZoom;
  export let maxZoom;
  export let zoom;

  export let centerLatitude;
  export let centerLongitude;
  export let maxLat;
  export let minLat;
  export let maxLong;
  export let minLong;


  const step = 0.1;
  const springValues = { stiffness: 0.15, damping: 1 };
  function zoomInStep() {
	  zoom += 0.1;
  }
  function zoomOutStep() {
	  zoom -= 0.1;
  }

  function panRight(){
    centerLongitude += 5;
  }

  function panLeft(){
    centerLongitude -= 5;
  }

  function panUp(){
    centerLatitude += 5;
  }

  function panDown(){
    centerLatitude -= 5;
  }
</script>

<h1>Perspective</h1>
<h2>Zoom</h2>
<p>Zoom in and out by moving the slider up and down or left and right.</p>
<!-- <h2>Vertical</h2>
<div class="vertical">
  <div class = "up">
    <Button
    variant="raised"
    color="secondary"
    class="stepper-btn right"
    on:click={zoomOutStep}>
    <Subtract32 />
    </Button> </div>
  <RangeSlider
    bind:value={zoom}
    min={minZoom}
    max={maxZoom}
    {step}
    {springValues}
    vertical
    float
  />
  <div class = "down">
    <Button
    variant="raised"
    color="secondary"
    class="stepper-btn right"
    on:click={zoomInStep}>
    <Add32 />
    </Button> </div>
</div> -->

<div class="horizontal">
  <div class = "left">
    <Button
    variant="raised"
    color="secondary"
    class="stepper-btn right"
    on:click={zoomOutStep}>
    <Subtract32 />
    </Button></div>

  <RangeSlider
    bind:value={zoom}
    min={minZoom}
    max={maxZoom}
    {step}
    {springValues}
    float
  />

  <div class = "right">
    <Button
    variant="raised"
    color="secondary"
    class="stepper-btn right"
    on:click={zoomInStep}>
    <Add32 />
    </Button></div>
</div>


<h2>Pan</h2>
<!-- Pan buttons -->
<p>Pan up and down, left or right by either using the buttons or the sliders</p>

<!--
<div class = "wrapper">
  <div class = "box box-outer1"></div>
  <div class = "box box-outer2"></div>
  <div class = "box box-outer3"></div>
  <div class = "box box-outer4"></div>
</div> -->
<div>
<div class="vertical">
  <CaretUpGlyph />
  <RangeSlider
    bind:value={centerLatitude}
    min={minLat}
    max={maxLat}
    {step}
    {springValues}
    vertical
    float
  />
  <CaretDownGlyph />
</div>

<div class="container">
  <div class="cell cell-1"></div>
  <div class="cell cell-2">
    <Button
    variant="raised"
    color="secondary"
    class="stepper-btn right"
    on:click={panUp}>
    <CaretUpGlyph />
    </Button>
  </div>
  <div class="cell cell-3"></div>
  <div class="cell cell-4">
    <Button
    variant="raised"
    color="secondary"
    class="stepper-btn right"
    on:click={panLeft}>
    <CaretLeftGlyph />
    </Button>
  </div>
  <div class="cell cell-5"></div>
  <div class="cell cell-6">
    <Button
    variant="raised"
    color="secondary"
    class="stepper-btn right"
    on:click={panRight}>
    <CaretRightGlyph />
    </Button>
  </div>
  <div class="cell cell-7"></div>
  <div class="cell cell-8">
    <Button
    variant="raised"
    color="secondary"
    class="stepper-btn right"
    on:click={panDown}>
    <CaretDownGlyph />
    </Button>
  </div>
  <div class="cell cell-9"></div>
</div>
</div>





<div class="horizontal">
      <CaretLeftGlyph />
      <RangeSlider
        bind:value={centerLongitude}
        min={minLong}
        max={maxLong}
        {step}
        {springValues}
        float
      />
      <CaretRightGlyph />
</div>



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
  .container {
  height: 20vh;
  margin: 2rem;
  display: grid;
  grid-template-columns: 50px 50px 50px;
  grid-template-rows: 50px 50px 50px;
}
.cell {
  color: white;
  text-align: center;
  padding: 4rem;
  height:50px;
  width:50px;
}
</style>
