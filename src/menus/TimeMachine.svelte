<script>
  import Calendar from '../components/Calendar.svelte';
  import TimeStepper from '../components/TimeStepper.svelte';
  import RangeLoader from '../components/RangeLoader.svelte';
  import { validDate } from '../utility.js';

  export let date;
  export let fetcher;
  export let griddedDataset;
  export let particlesShown;
  export let advancedOptions;

  // kinda a hack to ensure date update propagates to this components children
  $: {
    let valid = validDate(griddedDataset, date);
    if (valid.getTime() !== date.getTime()) {
      date = valid;
    }
  }
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

{#if advancedOptions}
  <h2>Range Loader (No Streamlines)</h2>
  <RangeLoader
    bind:date
    {fetcher}
    {griddedDataset}
    bind:particlesShown
  />
{/if}
