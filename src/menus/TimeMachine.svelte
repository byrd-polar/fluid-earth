<script>
  import Calendar from '../components/Calendar.svelte';
  import TimeStepper from '../components/TimeStepper.svelte';
  import RangeLoader from '../components/RangeLoader.svelte';

  export let date;
  export let fetcher;
  export let griddedDataset;
  export let particlesShown;
  export let menusDetailed;
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

{#if menusDetailed}
  <h2>Range Loader (No Streamlines)</h2>
  <RangeLoader
    bind:date
    {fetcher}
    {griddedDataset}
    bind:particlesShown
  />
{/if}
