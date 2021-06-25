<script>
  import Player from '../components/Player.svelte';
  import { getValidDates } from '../utility.js';

  export let fetcher;
  export let utc;
  export let simplifiedMode;
  export let griddedDataset;
  export let date;
  export let particlesShown;
  export let openedMenu;

  let pause, playerActive;

  $: validDates = getValidDates(griddedDataset);
  $: if (openedMenu === 'Time Machine') pause();
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
  bind:active={playerActive}
  bind:pause
/>


<details>
  <summary><h2>Settings</h2></summary>
  <p>Use the Datasets and Time Machine menus to change the variable displayed
  and the starting date, respectively.</p>
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
