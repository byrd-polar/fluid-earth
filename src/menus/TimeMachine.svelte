<script>
  import TimeJumper from '../components/TimeJumper.svelte';
  import Calendar from '../components/calendar/Calendar.svelte';
  import Player from '../components/Player.svelte';
  import RangeSettings from '../components/RangeSettings.svelte';
  import { getValidDates } from '../utility.js';

  export let date;
  export let utc;
  export let griddedDataset;
  export let simplifiedMode;
  export let particlesShown;

  let playerActive, fps;
  let validDates = getValidDates(griddedDataset);
</script>

<details open>
<summary><h2>Jump to</h2></summary>
<TimeJumper
  {griddedDataset}
  bind:date
/>
</details>

<details open>
<summary><h2>Time Picker</h2></summary>
<Calendar
  {griddedDataset}
  bind:date
  {utc}
/>
</details>

<details>
<summary><h2>Timelapse</h2></summary>
<Player
  {utc}
  {simplifiedMode}
  {validDates}
  {griddedDataset}
  bind:date
  bind:particlesShown
  bind:sliding={playerActive}
  {fps}
/>
<RangeSettings
  {date}
  {utc}
  {playerActive}
  {griddedDataset}
  bind:validDates
  bind:fps
/>
</details>

<svelte:options immutable={true} />
