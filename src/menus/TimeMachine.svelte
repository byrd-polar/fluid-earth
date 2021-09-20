<script>
  import TimeJumper from '../components/TimeJumper.svelte';
  import Calendar from '../components/calendar/Calendar.svelte';
  import TimeStepper from '../components/TimeStepper.svelte';
  import { getValidDates } from '../utility.js';

  export let date;
  export let utc;
  export let griddedDataset;

  $: validDates = getValidDates(griddedDataset);
</script>

<h2>Jump To</h2>
<TimeJumper
  {griddedDataset}
  bind:date
/>

<h2>Time Picker</h2>
<Calendar
  {griddedDataset}
  bind:date
/>

<svelte:options immutable={true} />
