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

  function zom(change) {
    zoom = clamp(zoom + change, minZoom, maxZoom);
  }

  function pan({ up=0, down=0, left=0, right=0 }) {
    centerLatitude = clamp(centerLatitude + up - down, minLat, maxLat);
    centerLongitude = clamp(centerLongitude + right - left, minLong, maxLong);
  }

  function clamp(x, min, max) {
    return x > max ? max : (x < min ? min : x);
  }
</script>

<h2>Zoom Controls</h2>

<div class="slider">
  <Button secondary
    action={() => zom(-0.1)}
    disabled={zoom === minZoom}
    tip="Zoom out"
  >
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
  <Button secondary
    action={() => zom(+0.1)}
    disabled={zoom === maxZoom}
    tip="Zoom in"
  >
    <Add24 />
  </Button>
</div>


<h2>Pan Controls</h2>

<div class="pan-controls">
  <Button secondary
    action={() => pan({ up: 5 })}
    disabled={centerLatitude === maxLat}
    tip="Pan up"
  >
    <CaretUpGlyph />
  </Button>

  <Button secondary
    action={() => pan({ down: 5 })}
    disabled={centerLatitude === minLat}
    tip="Pan down"
    tipPlacement="bottom"
  >
    <CaretDownGlyph />
  </Button>

  <Button secondary
    action={() => pan({ left: 5 })}
    disabled={centerLongitude === minLong}
    tip="Pan left"
    tipPlacement="left"
  >
    <CaretLeftGlyph />
  </Button>

  <Button secondary
    action={() => pan({ right: 5 })}
    disabled={centerLongitude === maxLong}
    tip="Pan right"
    tipPlacement="right"
  >
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
