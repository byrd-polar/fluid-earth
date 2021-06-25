<script>
  import Pause from 'carbon-icons-svelte/lib/PauseFilled32';
  import Play from 'carbon-icons-svelte/lib/PlayFilled32';
  import RangeSlider from 'svelte-range-slider-pips';
  import { capitalizeFirstLetter, simpleTranslate } from '../utility.js';
  import prettyMilliseconds from 'pretty-ms';
  import { tick } from 'svelte';

  export let fetcher;
  export let validDates;
  export let utc;
  export let simplifiedMode;

  export let griddedDataset;

  export let date;
  export let particlesShown;

  $: dateOptions = {
    timeZone: utc ? 'UTC' : undefined,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  $: name = griddedDataset.name;
  $: title = simplifiedMode ? simpleTranslate(name) : name;
  $: range = validDates[validDates.length - 1] - validDates[0];

  let playing = false;
  let loading = false;
  let particlesOriginallyShown = particlesShown;
  let timeoutID;
  let value = 0;

  $: value, slideDate();
  $: griddedDataset, particlesShown, handlePause();

  async function handlePlay() {
    particlesOriginallyShown = particlesShown;
    particlesShown = false;

    await tick();

    playing = true;
    loading = true;

    let fetches = [];
    for (const d of validDates) {
      fetches.push(fetcher.fetch(griddedDataset, d, 'player', false));
    }

    let results = await Promise.all(fetches);
    loading = false;

    if (results.every(r => r)) loopDate();
  }

  function loopDate() {
    let time = 200;
    if (value >= validDates.length - 1) {
      value = 0;
      time = 1000;
    } else {
      value++;
      if (value === validDates.length - 1) {
        time = 1000;
      }
    }
    timeoutID = window.setTimeout(loopDate, time);
  }

  function handlePause() {
    if (!playing) return;

    if (loading) fetcher.abort('player');

    window.clearTimeout(timeoutID);
    playing = false;
    if (!particlesShown) particlesShown = particlesOriginallyShown;
  }

  function slideDate() {
    date = validDates[value];
  }

  function handleStart() {
    handlePause();
    particlesOriginallyShown = particlesShown;
    particlesShown = false;
  }

  function handleStop() {
    particlesShown = particlesOriginallyShown;
  }
</script>

<div>
  <button on:click={playing ? handlePause : handlePlay}>
    {#if playing}
      <Pause />
    {:else}
      <Play />
    {/if}
  </button>
  <h3>{capitalizeFirstLetter(title)}</h3>
  <p>{prettyMilliseconds(range, {verbose: true})} starting on
  {validDates[0].toLocaleDateString(undefined, dateOptions)}</p>
  <RangeSlider
    bind:value
    on:start={handleStart}
    on:stop={handleStop}
    min={0}
    max={validDates.length - 1}
    springValues={{ stiffness: 1, damping: 1 }}
    formatter={v => {
      const d = validDates[v];
      return d.toLocaleString(undefined, { hour: 'numeric' });
    }}
    float pips
  />
</div>

<style>
  div {
    display: grid;
    height: 100px;
    grid-template-columns: 100px 1fr;
    grid-template-rows: min-content 1fr min-content;
    margin-bottom: 1em;

    border-radius: 0.5em;
    background-color: var(--input-color);
  }

  button {
    all: unset;
    -webkit-tap-highlight-color: transparent;
    transition: filter 0.25s ease 0s;
    box-sizing: border-box;
    color: white;
    padding: 0.5em 1em;
    background-color: var(--primary-color);
    cursor: pointer;
    grid-row: 1 / span 3;
    background: var(--primary-color);

    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.5em 0 0 0.5em;
  }

  button:focus, button:hover {
    filter: brightness(125%);
  }

  button:disabled {
    cursor: auto;
    background-color: rgba(0, 0, 0, 0.88);
    color: rgba(255, 255, 255, 0.58);
    filter: none;
  }

  button :global(svg) {
    width: 48px;
    height: 48px;
    transition: transform 0.25s ease 0s;
  }


  button:focus-visible :global(svg), button:hover :global(svg) {
    transform: scale(1.2);
  }

  h3 {
    margin: 0.5rem 0.75rem 0.25rem;
    font-size: 1rem;
  }

  p {
    font-size: 0.9rem;
    margin: 0 0.75rem;
  }

  h3, p {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  div :global(.rangeSlider) {
    margin-bottom: 1em;
  }
</style>
