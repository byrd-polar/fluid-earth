<script>
  import Add24 from "carbon-icons-svelte/lib/Add24";
  import Subtract24 from "carbon-icons-svelte/lib/Subtract24";
  import CaretLeftGlyph from "carbon-icons-svelte/lib/CaretLeftGlyph";
  import CaretRightGlyph from "carbon-icons-svelte/lib/CaretRightGlyph";
  import CaretUpGlyph from "carbon-icons-svelte/lib/CaretUpGlyph";
  import CaretDownGlyph from "carbon-icons-svelte/lib/CaretDownGlyph";
  import RangeSlider from 'svelte-range-slider-pips';
  import Button from '../components/Button.svelte';
  import { clamp } from '../utility.js';
  import colormaps, { types } from '../map/colormaps/';
  import projections from '../map/projections/';

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

  export let inventory;
  export let MAX_TEXTURE_SIZE;
  export let griddedDataset;
  export let particleDataset;
  export let griddedColormap;

  let griddedDatasets = inventory.filter(d => d.colormap)
  let particleDatasets = inventory.filter(d => d.particleDisplay);

  export let projection;
</script>

<h2>Note about this menu</h2>

<p>
This menu does not exist in the production build. It is used as a debugging tool
when adding new datasets/colormaps/projections and for experimenting with new
user interface components.

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

<h2>All Datasets</h2>

<h3>Gridded</h3>
{#each griddedDatasets as dataset}
  <label>
    <input
      type="radio"
      name="griddedDataset"
      bind:group={griddedDataset}
      value={dataset}
      disabled={Math.max(dataset.width, dataset.height) > MAX_TEXTURE_SIZE}
    >
    {dataset.name}
  </label>
{/each}

<h3>Particle</h3>
{#each particleDatasets as dataset}
  <label>
    <input
      type="radio"
      name="particleDataset"
      bind:group={particleDataset}
      value={dataset}
      disabled={Math.max(dataset.width, dataset.height) > MAX_TEXTURE_SIZE}
    >
    {dataset.name}
  </label>
{/each}

<h2>About colormaps</h2>

<p>
Colormaps define how numerical values are converted to colors to display on the
map.
</p>
<p>
Perceptions of data are heavily influenced by the choice of colormap, so it is
important for science communicators to select an appropriate colormap for their
data. Toggle between the colormaps below to see how the same data looks when
presented with different colors.
</p>

<h2>All Colormaps</h2>

{#each [...types] as type}
  <h3>{type}</h3>

  {#each Object.values(colormaps).filter(map => map.type === type) as map}
    <label>
      <input
        type="radio"
        bind:group={griddedColormap}
        value={map}
      >
      {map.name}
    </label>
  {/each}
{/each}

<h2>About projections</h2>
<p>
Map projections are the various ways of taking a three-dimensional globe and
projecting it to the two-dimensional surface of a map.
<p>
This will always distort the globe in some way, so each projection has its
tradeoffs and use cases.

<h2>All Projections</h2>

{#each Object.values(projections) as p}
<label>
  <input
    type="radio"
    bind:group={projection}
    value={p}
  >
  {p.name}
</label>
{/each}

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

  label {
    padding: 0.25em 0;
    display: block;
    cursor: pointer;
  }

  label:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }

  h3 {
    margin: 1em 0 0.25em;
    font-size: 1em;
  }
</style>
