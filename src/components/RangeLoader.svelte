<script>
  export let date;
  export let dataset;

  const msInHour = 60 * 60 * 1000;

  const dateOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short',
  }

  let timepoints = 10;
  let interval = dataset.intervalInHours;

  $: endDate = new Date(date.getTime() + (timepoints-1) * interval * msInHour);
</script>

<div>
  <label for="range-timepoints">Number of timepoints:</label>
  <input
    id="range-timepoints"
    type="number"
    bind:value={timepoints}
    min="2"
    max={((dataset.end - date) / (interval * msInHour)) + 1}
    step="1"
  />
  <label for="range-inc">Interval (hours):</label>
  <input
    id="range-inc"
    type="number"
    bind:value={interval}
    min={dataset.intervalInHours}
    max={(dataset.end - date) / ((timepoints-1) * msInHour)}
    step={dataset.intervalInHours}
  />
  <p>
    End date:
    <span>{endDate.toLocaleDateString(undefined, dateOptions)}</span>
  </p>
</div>

<style>
  div {
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

  p {
    grid-column-start: span 2;
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
