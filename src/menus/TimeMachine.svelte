<script>
  import TimeJumper from '../components/TimeJumper.svelte';
  import Calendar from '../components/Calendar.svelte';
  import TimeStepper from '../components/TimeStepper.svelte';
  import RangeLoader from '../components/RangeLoader.svelte';

  export let date;
  export let utc;
  export let fetcher;
  export let griddedDataset;
  export let particlesShown;
  export let advancedOptions;
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
  dataset={griddedDataset}
  bind:date
  {utc}
/>

{#if advancedOptions}
  <h2>Range Loader (No Streamlines)</h2>
  <RangeLoader
    bind:date
    {fetcher}
    {griddedDataset}
    bind:particlesShown
    {utc}
  />
{/if}

<svelte:options immutable={true} />
