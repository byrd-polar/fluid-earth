<script>
  import Calendar from '../components/Calendar.svelte';
  import TimeStepper from '../components/TimeStepper.svelte';

  export let date;
  export let griddedDataset;
</script>

<h2>Calendar</h2>
<Calendar
  minDate={griddedDataset.start}
  maxDate={griddedDataset.end}
  bind:date
/>

<h2>Time Stepper</h2>
<TimeStepper
  dataset={griddedDataset}
  bind:date
/>
