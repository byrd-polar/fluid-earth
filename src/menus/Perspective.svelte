<script>
  import Add24 from "carbon-icons-svelte/lib/Add24";
  import Subtract24 from "carbon-icons-svelte/lib/Subtract24";
  import CaretLeftGlyph from "carbon-icons-svelte/lib/CaretLeftGlyph";
  import CaretRightGlyph from "carbon-icons-svelte/lib/CaretRightGlyph";
  import CaretUpGlyph from "carbon-icons-svelte/lib/CaretUpGlyph";
  import CaretDownGlyph from "carbon-icons-svelte/lib/CaretDownGlyph";
  import RangeSlider from 'svelte-range-slider-pips';
  import Button from '../components/Button.svelte';

  export let minZoom;
  export let maxZoom;
  export let zoom;

  export let centerLatitude;
  export let centerLongitude;
  export let maxLat;
  export let minLat;
  export let maxLong;
  export let minLong;


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

<h2>Zoom Controls</h2>

<div class="horizontal">
  <div class = "left">
    <Button action={zoomOutStep} secondary tip="Zoom out">
      <Subtract24 />
    </Button>
  </div>
  <RangeSlider
    bind:value={zoom}
    min={minZoom}
    max={maxZoom}
    step={0.1}
    {springValues}
    float
    formatter={v => `Zoom: ${v}`}
  />

  <div class = "right">
    <Button action={zoomInStep} secondary tip="Zoom in">
      <Add24 />
    </Button>
  </div>
</div>


<h2>Pan Controls</h2>
<!-- Pan buttons -->

<div>
<div class="vertical">
  <CaretUpGlyph />
  <RangeSlider
    bind:value={centerLatitude}
    min={minLat}
    max={maxLat}
    {springValues}
    vertical
    float
    formatter={v => `Lat: ${v}`}
  />
  <CaretDownGlyph />
</div>

<div class="container">
  <div class="cell cell-1"></div>
  <div class="cell cell-2">
    <Button action={panUp} secondary tip="Pan up">
      <CaretUpGlyph />
    </Button>
  </div>
  <div class="cell cell-3"></div>
  <div class="cell cell-4">
    <Button action={panLeft} secondary tip="Pan left" tipPlacement="left">
      <CaretLeftGlyph />
    </Button>
  </div>
  <div class="cell cell-5"></div>
  <div class="cell cell-6">
    <Button action={panRight} secondary tip="Pan right" tipPlacement="right">
      <CaretRightGlyph />
    </Button>
  </div>
  <div class="cell cell-7"></div>
  <div class="cell cell-8">
    <Button action={panDown} secondary tip="Pan down" tipPlacement="bottom">
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
        {springValues}
        float
        formatter={v => `Lon: ${v}`}
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
