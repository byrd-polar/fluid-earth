<script>
  import Add from 'carbon-icons-svelte/lib/Add.svelte';
  import Subtract from 'carbon-icons-svelte/lib/Subtract.svelte';
  import CaretLeft from 'carbon-icons-svelte/lib/CaretLeft.svelte';
  import CaretRight from 'carbon-icons-svelte/lib/CaretRight.svelte';
  import CaretUp from 'carbon-icons-svelte/lib/CaretUp.svelte';
  import CaretDown from 'carbon-icons-svelte/lib/CaretDown.svelte';
  import RangeSlider from 'svelte-range-slider-pips';
  import Button from '../components/Button.svelte';
  import { clamp } from '../math.js';
  import colormaps, { types } from '../map/colormaps/';
  import projections from '../map/projections/';
  import { uniqueId } from '../utility.js';

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

  export let gDatasets;
  export let pDatasets;
  export let griddedDataset;
  export let particleDataset;
  export let griddedColormap;

  export let projection;

  const griddedRadioName = uniqueId();
  const particleRadioName = uniqueId();
  const colormapRadioName = uniqueId();
  const projectionRadioName = uniqueId();
</script>

<details open>
<summary><h2>Note about this menu</h2></summary>
<p>
This menu does not exist in the production build. It is used as a debugging tool
when adding new datasets/colormaps/projections and for experimenting with new
user interface components.
</details>

<details>
<summary><h2>Zoom Controls</h2></summary>
<div class="slider">
  <Button secondary
    action={() => zom(-0.1)}
    disabled={zoom === minZoom}
    tip="Zoom out"
  >
    <Subtract size={24} />
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
    <Add size={24} />
  </Button>
</div>
</details>

<details>
<summary><h2>Pan Controls</h2></summary>
<div class="pan-controls">
  <Button secondary
    action={() => pan({ up: 5 })}
    disabled={centerLatitude === maxLat}
    tip="Pan up"
  >
    <CaretUp />
  </Button>

  <Button secondary
    action={() => pan({ down: 5 })}
    disabled={centerLatitude === minLat}
    tip="Pan down"
    tipPlacement="bottom"
  >
    <CaretDown />
  </Button>

  <Button secondary
    action={() => pan({ left: 5 })}
    disabled={centerLongitude === minLong}
    tip="Pan left"
    tipPlacement="left"
  >
    <CaretLeft />
  </Button>

  <Button secondary
    action={() => pan({ right: 5 })}
    disabled={centerLongitude === maxLong}
    tip="Pan right"
    tipPlacement="right"
  >
    <CaretRight />
  </Button>

  <div class="slider vertical">
    <CaretUp />
    <RangeSlider
      bind:value={centerLatitude}
      min={minLat}
      max={maxLat}
      {springValues}
      vertical
      float
      formatter={v => `Lat: ${v}`}
    />
    <CaretDown />
  </div>

  <div class="slider">
    <CaretLeft />
    <RangeSlider
      bind:value={centerLongitude}
      min={minLong}
      max={maxLong}
      {springValues}
      float
      formatter={v => `Lon: ${v}`}
    />
    <CaretRight />
  </div>
</div>
</details>

<details>
<summary><h2>All Datasets</h2></summary>
<h3>Gridded</h3>
{#each gDatasets as dataset}
  <label>
    <input
      type="radio"
      name={griddedRadioName}
      bind:group={griddedDataset}
      value={dataset}
    >
    {dataset.name}
  </label>
{/each}

<h3>Particle</h3>
{#each pDatasets as dataset}
  <label>
    <input
      type="radio"
      name={particleRadioName}
      bind:group={particleDataset}
      value={dataset}
    >
    {dataset.name}
  </label>
{/each}
</details>

<details>
<summary><h2>About colormaps</h2></summary>
<p>
Colormaps define how numerical values are converted to colors to display on the
map.
<p>
Perceptions of data are heavily influenced by the choice of colormap, so it is
important for science communicators to select an appropriate colormap for their
data. Toggle between the colormaps below to see how the same data looks when
presented with different colors.
</details>

<details>
<summary><h2>All colormaps</h2></summary>
{#each [...types] as type}
  <h3>{type}</h3>

  {#each Object.values(colormaps).filter(map => map.type === type) as map}
    <label>
      <input
        type="radio"
        name={colormapRadioName}
        bind:group={griddedColormap}
        value={map}
      >
      {map.name}
    </label>
  {/each}
{/each}
</details>

<details>
<summary><h2>About projections</h2></summary>
<p>
Map projections are the various ways of taking a three-dimensional globe and
projecting it to the two-dimensional surface of a map.
<p>
This will always distort the globe in some way, so each projection has its
tradeoffs and use cases.
</details>

<details>
<summary><h2>All projections</h2></summary>
{#each Object.values(projections) as p}
<label>
  <input
    type="radio"
    name={projectionRadioName}
    bind:group={projection}
    value={p}
  >
  {p.name}
</label>
{/each}
</details>

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
