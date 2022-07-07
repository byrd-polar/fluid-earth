<script>
  import TimeJumper from '../components/TimeJumper.svelte';
  import Calendar from '../components/calendar/Calendar.svelte';
  import Player from '../components/Player.svelte';
  import RangeSettings from '../components/RangeSettings.svelte';

  export let date;
  export let utc;
  export let timeDataset;
  export let particleDataset;

  let playerActive, fps;
  let validDates = timeDataset.validDates; // reactive via RangeSettings
</script>

<details open>
<summary><h2>Jump to</h2></summary>
<TimeJumper
  {timeDataset}
  bind:date
/>
</details>

<details open>
<summary><h2>Time Picker</h2></summary>
<Calendar
  {timeDataset}
  bind:date
  {utc}
/>
</details>

{#if timeDataset.type === 'gridded'}
<details>
<summary><h2>Timelapse</h2></summary>
<Player
  {utc}
  {validDates}
  griddedDataset={timeDataset}
  bind:date
  bind:particleDataset
  bind:sliding={playerActive}
  {fps}
/>
<RangeSettings
  {date}
  {utc}
  {playerActive}
  griddedDataset={timeDataset}
  bind:validDates
  bind:fps
/>
</details>
{/if}

<svelte:options immutable={true} />
