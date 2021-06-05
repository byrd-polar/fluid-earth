<script>
  import TimeJumper from '../components/TimeJumper.svelte';
  import Calendar from '../components/Calendar.svelte';
  import TimeStepper from '../components/TimeStepper.svelte';
  import { getValidDates } from '../utility.js';

  export let date;
  export let utc;
  export let fetcher;
  export let griddedDataset;
  export let particlesShown;

  $: validDates = getValidDates(griddedDataset);
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

<svelte:options immutable={true} />
