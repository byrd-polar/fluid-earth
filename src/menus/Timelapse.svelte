<script>
  import Player from '../components/Player.svelte';
  import RangeSettings from '../components/RangeSettings.svelte';
  import { getValidDates } from '../utility.js';

  export let fetcher;
  export let utc;
  export let simplifiedMode;
  export let griddedDataset;
  export let date;
  export let particlesShown;

  let playerActive, fps;
  let validDates = getValidDates(griddedDataset);
</script>

<h2>Playlist</h2>
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

<details>
  <summary><h2>Settings</h2></summary>
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
  details {
    margin-bottom: 1em;
    -webkit-tap-highlight-color: transparent;
  }

  summary {
    cursor: pointer;
    border-bottom: 1px solid;
  }

  summary h2 {
    display: inline;
    border-bottom: none;
  }
</style>
