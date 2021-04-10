<script>
  import Calendar from '../components/Calendar.svelte';
  import TimeStepper from '../components/TimeStepper.svelte';
  import RangeLoader from '../components/RangeLoader.svelte';

  export let date;
  export let fetcher;
  export let griddedDataset;
  export let particleDataset;
  export let particlesShown;
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

<h2>Range Loader</h2>
<RangeLoader
  bind:date
  {fetcher}
  {griddedDataset}
  bind:particlesShown
/>
