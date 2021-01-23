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

<div class="slider">
  <Button action={zoomOutStep} secondary tip="Zoom out">
    <Subtract24 />
  </Button>
  <RangeSlider
    bind:value={zoom}
    min={minZoom}
    max={maxZoom}
    step={0.1}
    {springValues}
    float
    formatter={v => `Zoom: ${v}`}
  />
  <Button action={zoomInStep} secondary tip="Zoom in">
    <Add24 />
  </Button>
</div>


<h2>Pan Controls</h2>

<div class="pan-controls">
  <Button action={panUp} secondary tip="Pan up">
    <CaretUpGlyph />
  </Button>

  <Button action={panDown} secondary tip="Pan down" tipPlacement="bottom">
    <CaretDownGlyph />
  </Button>

  <Button action={panLeft} secondary tip="Pan left" tipPlacement="left">
    <CaretLeftGlyph />
  </Button>

  <Button action={panRight} secondary tip="Pan right" tipPlacement="right">
    <CaretRightGlyph />
  </Button>

  <div class="slider vertical">
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

  <div class="slider">
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
</div>

<style>
  div.slider {
    display: flex;
    align-items: center;
    width: 100%;
  }

  div.slider > :global(:nth-child(2)) {
    flex: 1;
  }

  div.slider.vertical {
    flex-direction: column;
  }

  div.pan-controls {
    display: grid;
    grid-template-areas:
      "e . . . . ."
      "e . . a . ."
      "e . c . d ."
      "e . . b . ."
      "e . . . . ."
      ". f f f f f";
    grid-template-columns: min-content 1fr repeat(3, min-content) 1fr;
    grid-template-rows: 1fr repeat(3, min-content) 1fr min-content;
  }

  div.pan-controls > :global(:nth-child(1)) { grid-area: a; }
  div.pan-controls > :global(:nth-child(2)) { grid-area: b; }
  div.pan-controls > :global(:nth-child(3)) { grid-area: c; }
  div.pan-controls > :global(:nth-child(4)) { grid-area: d; }
  div.pan-controls > :global(:nth-child(5)) { grid-area: e; }
  div.pan-controls > :global(:nth-child(6)) { grid-area: f; }
</style>
