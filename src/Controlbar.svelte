<script>
  import IconButton from './components/IconButton.svelte';
  import SkipBackFilled24 from "carbon-icons-svelte/lib/SkipBackFilled24";
  import PauseFilled24 from "carbon-icons-svelte/lib/PauseFilled24";
  import PlayFilledAlt24 from "carbon-icons-svelte/lib/PlayFilledAlt24";
  import SkipForwardFilled24 from "carbon-icons-svelte/lib/SkipForwardFilled24";
  import RangeSlider from 'svelte-range-slider-pips';

  export let fetcher;
  export let inventory;
  export let griddedDataset;
  export let particlesShown;
  export let date;


  let playing = false;
  let loading = false;
  let timeoutID;
  let value = 0;

  $: value, slideDate();

  $: datasets = inventory.filter(d => {
    return d.colormap &&
      (d.lastForecastSystem === 'gdas' || d.lastForecastSystem === 'gfs');
  });

  $: hidden = !datasets.includes(griddedDataset);
  $: griddedDataset, handlePause();
  $: particlesShown = !playing;

  function skipDataset(step) {
    const currentIndex = datasets.findIndex(d => d === griddedDataset);
    const divisor = datasets.length;
    griddedDataset = datasets[(currentIndex + step + divisor) % divisor];
  }

  function handlePause() {
    if (loading) fetcher.abort('range-loader');

    window.clearTimeout(timeoutID);
    playing = false;
  }

  const msInHour = 60 * 60 * 1000;
  let start = date;
  let end = new Date(start.getTime() + 9 * msInHour);

  async function handlePlay() {
    playing = true;
    loading = true;

    let fetches = [];
    for (let i = 0; i < 10; i++) {
      let d = new Date(start.getTime() + i * msInHour);
      fetches.push(fetcher.fetch(griddedDataset, d, 'range-loader', false));
    }

    let results = await Promise.all(fetches);
    loading = false;

    if (results.every(r => r)) loopDate();
  }

  function loopDate() {
    let time = 200;
    if (value === 9) {
      value = 0
      time = 1000;
    } else {
      value++
      if (value === 9) {
        time = 1000;
      }
    }
    timeoutID = window.setTimeout(loopDate, time);
  }

  function slideDate() {
    date = new Date(start.getTime() + value * msInHour);
  }
</script>

<div class:hidden>
  <IconButton action={() => skipDataset(-1)}>
    <SkipBackFilled24 />
  </IconButton>
  {#if playing}
    <IconButton action={handlePause}>
      <PauseFilled24 />
    </IconButton>
  {:else}
    <IconButton action={handlePlay}>
      <PlayFilledAlt24 />
    </IconButton>
  {/if}
  <IconButton action={() => skipDataset(+1)}>
    <SkipForwardFilled24 />
  </IconButton>
  <RangeSlider
    min={0}
    max={9}
    step={1}
    bind:value
    springValues={{ stiffness: 1, damping: 1 }}
  />
</div>

<style>
  div {
    display: flex;
    background-color: var(--secondary-color);
    color: white;
    padding: 0.25em;
    align-items: center;
    filter: brightness(80%);
    box-shadow:
      0 -2px  4px -1px rgba(0,0,0,.2),
      0 -4px  5px  0   rgba(0,0,0,.14),
      0 -1px 10px  0   rgba(0,0,0,.12);
  }

  div > :global(:nth-child(4)) {
    flex: 1;
  }

  div.hidden {
    display: none;
  }
</style>
