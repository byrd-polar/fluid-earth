<script>
  import Pause from 'carbon-icons-svelte/lib/PauseFilled32';
  import Play from 'carbon-icons-svelte/lib/PlayFilled32';
  import Repeat from 'carbon-icons-svelte/lib/Repeat20';
  import RepeatOne from 'carbon-icons-svelte/lib/RepeatOne20';
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
  export let active = false;

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
  let repeat = false;

  $: value, slideDate();
  $: griddedDataset, particlesShown, pause();

  async function play() {
    particlesOriginallyShown = particlesShown;
    particlesShown = false;

    await tick();

    active = true;
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
        if (!repeat) {
          pause();
          return;
        }
        time = 1000;
      }
    }
    timeoutID = window.setTimeout(loopDate, time);
  }

  export function pause() {
    if (!playing) return;

    if (loading) fetcher.abort('player');

    window.clearTimeout(timeoutID);
    active = false;
    playing = false;
    if (!particlesShown) particlesShown = particlesOriginallyShown;
  }

  function slideDate() {
    date = validDates[value];
  }

  function handleStart() {
    pause();
    active = true;
    particlesOriginallyShown = particlesShown;
    particlesShown = false;
  }

  function handleStop() {
    particlesShown = particlesOriginallyShown;
    active = false;
  }
</script>

<div>
  <button on:click={playing ? pause : play} class="play">
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
    --range-range="var(--primary-color-light)"
    --range-pip="gray"
    --range-pip-active="gray"
    range="min" float pips
  />
  <button class="repeat" on:click={() => repeat = !repeat}>
    {#if repeat}
      <RepeatOne style="color: var(--primary-color-light" />
    {:else}
      <Repeat />
    {/if}
  </button>
</div>

<style>
  div {
    display: grid;
    height: 100px;
    grid-template-columns: 100px 1fr min-content;
    grid-template-rows: min-content 1fr min-content;
    margin-bottom: 1em;

    border-radius: 0.5em;
    background-color: var(--input-color);
  }

  button {
    all: unset;
    -webkit-tap-highlight-color: transparent;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  button.play {
    transition: filter 0.25s ease 0s;
    box-sizing: border-box;
    padding: 0.5em 1em;
    background-color: var(--primary-color);
    grid-row: 1 / span 3;
    background: var(--primary-color);

    border-radius: 0.5em 0 0 0.5em;
  }

  button.play:focus, button.play:hover {
    filter: brightness(125%);
  }

  button.play:disabled {
    cursor: auto;
    background-color: rgba(0, 0, 0, 0.88);
    color: rgba(255, 255, 255, 0.58);
    filter: none;
  }

  button.play :global(svg) {
    width: 48px;
    height: 48px;
    transition: transform 0.25s ease 0s;
  }


  button.play:focus-visible :global(svg),
  button.play:hover :global(svg) {
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
    grid-column: 2 / span 2;
  }

  div :global(.rangeSlider) {
    margin-bottom: 1em;
  }

  div :global(.rangeSlider .rangeHandle) {
    outline: none;
  }

  button.repeat {
    border-radius: 50%;
    height: 2em;
    width: 2em;
    margin: 0.25em 0.25em 0.25em 0;
  }

  button.repeat:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }

  button.repeat:focus {
    background-color: rgba(255, 255, 255, 0.15);
  }
</style>
