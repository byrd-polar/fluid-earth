<script>
  import TimeJumper from '../components/TimeJumper.svelte';
  import Calendar from '../components/calendar/Calendar.svelte';
  import Player from '../components/Player.svelte';
  import RangeSettings from '../components/RangeSettings.svelte';
  import { getValidDates } from '../utility.js';

  export let date;
  export let utc;
  export let griddedDataset;
  export let fetcher;
  export let simplifiedMode;
  export let particlesShown;

  let playerActive, fps;
  let validDates = getValidDates(griddedDataset);
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

<details>
  <summary><h2>Timelapse</h2></summary>
  <Player
    {fetcher}
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

<style>
  summary {
    margin: 0.83em 0;
    cursor: pointer;
    border-bottom: 1px solid;
  }

  summary h2 {
    display: inline;
    border-bottom: none;
  }
</style>

<svelte:options immutable={true} />
