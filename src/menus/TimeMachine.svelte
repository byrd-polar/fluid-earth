<script>
  import TimeJumper from '../components/TimeJumper.svelte';
  import Calendar from '../components/calendar/Calendar.svelte';
  import Player from '../components/Player.svelte';
  import RangeSettings from '../components/RangeSettings.svelte';

  export let date;
  export let utc;
  export let timeDataset;
  export let particleDataset;

  let playerActive = false;
  let fps = 5;
  let start = date;
  let timepoints = 10;
  let interval = 1;

  $: date, updateStart();

  function updateStart() {
    if (playerActive) return;

    start = date;
  }

  $: datesAfterStart = timeDataset.validDates.filter(d => d >= start);
  $: validDates = datesAfterStart
    .filter((_, i) => i % (interval || 1) === 0)
    .slice(0, (timepoints || 2));

  $: datesAfterStartLength = datesAfterStart.length;
  $: loadSize = validDates.length * timeDataset.bytesPerFile;
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
  {utc}
  {validDates}
  {datesAfterStartLength}
  {loadSize}
  bind:fps
  bind:start
  bind:timepoints
  bind:interval
/>
</details>
{/if}
