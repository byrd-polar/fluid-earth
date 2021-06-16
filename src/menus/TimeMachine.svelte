<script>
  import TimeJumper from '../components/TimeJumper.svelte';
  import Calendar from '../components/Calendar.svelte';
  import ChipGroup from '../components/ChipGroup.svelte';
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

<h2>Datetime Picker</h2>
<ChipGroup
  options={['Years', 'Months', 'Days', 'Hours']}
  expand
/>
<Calendar
  {griddedDataset}
  bind:date
  {utc}
/>

<svelte:options immutable={true} />
