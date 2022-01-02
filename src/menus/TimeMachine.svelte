<script>
  import TimeJumper from '../components/TimeJumper.svelte';
  import Calendar from '../components/calendar/Calendar.svelte';

  export let date;
  export let utc;
  export let griddedDataset;
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
  {utc}
/>

<svelte:options immutable={true} />
