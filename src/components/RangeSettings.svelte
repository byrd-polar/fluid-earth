<script>
  import { getValidDates } from '../utility.js';
  import prettyBytes from 'pretty-bytes';

  export let date;
  export let utc;
  export let playerActive;
  export let griddedDataset;
  export let validDates;
  export let fps = 5;

  let start = date, timepoints = 10, interval = 1;

  $: date, updateStart();

  $: datesAfterStart = getValidDates(griddedDataset)
    .filter(d => d >= start);

  $: validDates = datesAfterStart
    .filter((_, i) => i % (interval || 1) === 0)
    .slice(0, (timepoints || 2));

  $: end = validDates[validDates.length - 1];

  function updateStart() {
    if (playerActive) return;

    start = date;
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

  $: loadSize = validDates.length * griddedDataset.bytesPerFile;
</script>

<p>Use the Time Machine menu to change the start time.</p>

<div>
  <p>
    Start time: <span>{start.toLocaleDateString(undefined, dateOptions)}</span>
  </p>
  <label for="range-timepoints">Number of timepoints:</label>
  <input
    id="range-timepoints"
    type="number"
    bind:value={timepoints}
    min={2}
    max={Math.max(datesAfterStart.length, 2)}
    step={1}
  >
  <label for="range-interval">Interval (step size):</label>
  <input
    id="range-interval"
    type="number"
    bind:value={interval}
    min={1}
    max={Math.max(datesAfterStart.length - 1, 1)}
    step={1}
  />
  <p>
    End time: <span>{end.toLocaleDateString(undefined, dateOptions)}</span>
  </p>
  <label for="range-fps">Frames per second:</label>
  <input
    id="range-fps"
    type="number"
    bind:value={fps}
    min={1}
    step={1}
  />
</div>

<p>These settings will load <b>{prettyBytes(loadSize)}</b> into memory.</p>

<style>
  div {
    display: grid;
    grid-template-columns: 60% 40%;
    row-gap: 0.5em;
    padding: 0.5em;
    border: thin solid rgba(255, 255, 255, 0.3);
    border-radius: 0.5em;
    background-color: rgba(29, 29, 29, 0.75);
  }

  label, div p {
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

  div p {
    grid-column-start: span 2;
  }

  div p {
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
