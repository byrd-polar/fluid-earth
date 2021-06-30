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
  export let fps = 5;

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
  // used to enforce that updates to `date` from outside this component pause it
  let sliding = false, syncingValueWithDate = false;

  $: date, handleDateUpdate();

  $: maxValue = validDates.length - 1;
  $: time = 1000 / fps;

  $: value, slideDate();
  $: validDates, particlesShown, pause();

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

    if (results.every(r => r)) {
      if (value >= maxValue || value < 0) value = 0;
      timeoutID = window.setTimeout(loopDate, time);
    }
  }

  function loopDate() {
    let t = time;
    value = value + 1;

    if (value === maxValue) t = 1000;
    if (value > maxValue) {
      value = 0;
      if (!repeat) {
        pause();
        return;
      }
    }

    timeoutID = window.setTimeout(loopDate, t);
  }

  function pause() {
    if (!playing) return;

    if (loading) fetcher.abort('player');

    window.clearTimeout(timeoutID);
    active = false;
    playing = false;
    if (!particlesShown) particlesShown = particlesOriginallyShown;
  }

  async function slideDate() {
    if (syncingValueWithDate) return;

    sliding = true;
    await tick();
    date = validDates[value];
    await tick();
    sliding = false;
  }

  async function handleDateUpdate() {
    if (sliding) return;

    pause();

    syncingValueWithDate = true;
    await tick();
    value = validDates.findIndex(d => d.getTime() === date.getTime());
    await tick();
    syncingValueWithDate = false;
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
