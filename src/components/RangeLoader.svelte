<script>
  export let date;
  export let dataset;

  const dateOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short',
  }

  $: endDate = new Date(date.getTime());
</script>

<div>
  <label for="range-inc">Increment (hours):</label>
  <input
    id="range-inc"
    type="number"
    value={dataset.intervalInHours}
    min={dataset.intervalInHours}
    step={dataset.intervalInHours}
  />
  <label for="range-steps">Number of steps:</label>
  <input
    id="range-steps"
    type="number"
    value="12"
    min="1"
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
