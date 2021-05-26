<script>
  import TimeJumper from '../components/TimeJumper.svelte';
  import Calendar from '../components/Calendar.svelte';
  import TimeStepper from '../components/TimeStepper.svelte';
  import RangeLoader from '../components/RangeLoader.svelte';
  import { validOscarDates } from '../utility.js';

  export let date;
  export let utc;
  export let fetcher;
  export let griddedDataset;
  export let particlesShown;
  export let advancedOptions;

  $: validDates = getValidDates(griddedDataset);

  function getValidDates(dataset) {
    const dates = [];

    if (dataset.intervalInHours === 'custom:OSCAR') {
      let year = dataset.start.getUTCFullYear();
      while (year <= dataset.end.getUTCFullYear()) {
        dates.push(...validOscarDates(year));
        year++;
      }
      return dates.filter(d => d >= dataset.start && d <= dataset.end);
    }

    let t = dataset.start.getTime();
    while (t <= dataset.end.getTime()) {
      dates.push(new Date(t));
      t += dataset.intervalInHours * 60 * 60 * 1000;
    }
    return dates;
  }
</script>

<h2>Jump To</h2>
<TimeJumper
  {griddedDataset}
  bind:date
/>

<h2>Calendar</h2>
<Calendar
  {griddedDataset}
  bind:date
  {utc}
/>

<h2>Time Stepper</h2>
<TimeStepper
  {validDates}
  bind:date
  {utc}
/>

{#if advancedOptions}
  <h2>Range Loader (No Streamlines)</h2>
  <RangeLoader
    {validDates}
    bind:date
    {fetcher}
    {griddedDataset}
    bind:particlesShown
    {utc}
  />
{/if}

<svelte:options immutable={true} />
