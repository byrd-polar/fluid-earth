<script>
  import Button from './Button.svelte';
  import RangeSlider from 'svelte-range-slider-pips';
  import prettyBytes from 'pretty-bytes';
  import { tick } from 'svelte'

  export let validDates;
  export let date;
  export let utc;
  export let fetcher;
  export let griddedDataset;
  export let particlesShown;


  let lockStartIndex = false;

  let timepoints = 10;
  let interval = 1;
  let startIndex = 0;
  let index = 0;

  $: updateStartIndex(date);
  function updateStartIndex(date) {
    if (!lockStartIndex) {
      startIndex = validDates.findIndex(d => d.getTime() === date.getTime());
    }
  }

  // Max values based on following relationship + algebra:
  // startIndex + (timepoints-1) * interval <= validDates.length-1;
  $: timepointsMax =
    Math.floor((((validDates.length-1) - startIndex) / interval) + 1);
  $: intervalMax = timepoints === 1 ?
    1 :
    Math.floor(((validDates.length-1) - startIndex) / (timepoints-1));

  let loading = false;
  let loaded = false;

  $: startIndex, timepoints, interval, griddedDataset, particlesShown,
    loaded = false;

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
      let d = validDates[startIndex + i * interval];
      fetches.push(fetcher.fetch(griddedDataset, d, 'range-loader', false));
    }

    let results = await Promise.all(fetches);
    loading = false;

    if (results.every(r => r)) {
      particlesShown = false;
      await tick();
      index = 0;
      loaded = true;
    }
  }

  $: index, slideDate();

  let init = true;

  async function slideDate() {
    if (init) {
      init = false;
      return;
    }
    lockStartIndex = true;
    await tick();
    date = validDates[startIndex + index * interval];
    await tick();
    lockStartIndex = false;
  }

  $: dateOptions = {
    timeZone: utc ? 'UTC' : undefined,
    hour12: utc ? false : undefined,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short',
  };

  $: start = validDates[startIndex].toLocaleDateString(undefined, dateOptions);

  $: endIndex = Math.max(startIndex, startIndex + (timepoints-1) * interval);
  $: end = endIndex >= validDates.length ?
    'Over the limit' :
    validDates[endIndex].toLocaleDateString(undefined, dateOptions);

  $: loadSize = timepoints * griddedDataset.bytesPerFile;
</script>

<form on:submit={loadRange}>
  <p>
    Start time: <span>{start}</span>
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
    required
  />
  <label for="range-inc">Interval (step size):</label>
  <input
    id="range-inc"
    type="number"
    bind:value={interval}
    min={1}
    max={intervalMax}
    step={1}
    disabled={loading}
    required
  />
  <p>
    End time: <span>{end}</span>
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
      bind:value={index}
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
