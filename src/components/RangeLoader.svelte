<script>
  import Button from './Button.svelte';
  import RangeSlider from 'svelte-range-slider-pips';
  import prettyBytes from 'pretty-bytes';
  import { tick } from 'svelte'

  export let date;
  export let fetcher;
  export let griddedDataset;
  export let particleDataset;
  export let particlesShown;

  const msInHour = 60 * 60 * 1000;

  const dateOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short',
  }

  let timepoints = 10;
  let interval = griddedDataset.intervalInHours;
  $: timepointsMax = Math.max(
    Math.floor(((griddedDataset.end - date) / (interval * msInHour)) + 1),
    1
  );
  $: intervalMax = Math.max(
    Math.floor(
      (griddedDataset.end - date) /
      ((timepoints-1) * griddedDataset.intervalInHours * msInHour)
    ) * griddedDataset.intervalInHours,
    griddedDataset.intervalInHours
  );

  let start = date;
  $: date, updateStart();
  $: end = new Date(start.getTime() + (timepoints-1) * interval * msInHour);

  let loading = false;
  let loaded = false;

  $: start, griddedDataset, particleDataset, timepoints, interval,
    loaded = false;

  let baseDate = date;
  let value = 0;

  async function loadRange(e) {
    e.preventDefault(); // don't reload page (but still do form validation)

    if (loading) {
      fetcher.abort('range-loader');
      loading = false;
      return;
    }

    loading = true;

    let fetches = [];
    for (let i = 0; i < timepoints; i++) {
      let d = new Date(start.getTime() + i * interval * msInHour);
      fetches.push(fetcher.fetch(griddedDataset, d, 'range-loader', false));
    }

    let results = await Promise.all(fetches);
    loading = false;

    if (results.every(r => r)) {
      particlesShown = false;
      value = 0;
      loaded = true;
    }
  }

  $: value, slideDate();

  let lockStart = false;
  let init = true;

  async function slideDate() {
    if (init) {
      init = false;
      return;
    }
    lockStart = true;
    await tick();
    date = new Date(start.getTime() + value * interval * msInHour);
    await tick();
    lockStart = false;
  }

  function updateStart() {
    if (!lockStart) start = date;
  }

  $: loadSize = timepoints * griddedDataset.bytesPerFile;
</script>

<form on:submit={loadRange}>
  <p>
    Start time:
    <span>{start.toLocaleDateString(undefined, dateOptions)}</span>
  </p>
  <label for="range-timepoints">Number of timepoints:</label>
  <input
    id="range-timepoints"
    type="number"
    bind:value={timepoints}
    min={1}
    max={timepointsMax}
    step={1}
    disabled={loading}
  />
  <label for="range-inc">Interval (hours):</label>
  <input
    id="range-inc"
    type="number"
    bind:value={interval}
    min={griddedDataset.intervalInHours}
    max={intervalMax}
    step={griddedDataset.intervalInHours}
    disabled={loading || timepoints === 1}
  />
  <p>
    End time:
    <span>{end.toLocaleDateString(undefined, dateOptions)}</span>
  </p>

  {#if !loaded}
    <Button full type="submit" disabled={timepoints === 1}>
      {loading ? 'Cancel' : `Load Range (${prettyBytes(loadSize)})`}
    </Button>
  {:else}
    <RangeSlider
      min={0}
      max={timepoints-1}
      step={1}
      bind:value
      springValues={{ stiffness: 1, damping: 1 }}
      pips
    />
    <p>
      Current Time:
      <span>{date.toLocaleDateString(undefined, dateOptions)}</span>
    </p>
  {/if}
</form>

<style>
  form {
    display: grid;
    grid-template-columns: 60% 40%;
    row-gap: 0.5em;
  }

  label, p {
    display: flex;
    align-items: center;
  }

  input {
    font: inherit;
    color: white;
    background-color: var(--input-color);
    border: none;
    border-radius: 4px;
    padding: 0 0.25em;
    height: 2em;
    text-align: center;
  }

  /* Keep stepper buttons visible without needed to hover on desktop Chrome */
  input::-webkit-inner-spin-button {
    opacity: 1;
  }

  p, form > :global(:not(label):not(input)) {
    grid-column-start: span 2;
  }

  p {
    margin: 0;
    white-space: nowrap;
  }

  span {
    font-weight: bold;
    margin-left: auto;
    text-align: right;
    white-space: normal;
  }
</style>
