<script>
  import Pause from 'carbon-icons-svelte/lib/PauseFilled.svelte';
  import Play from 'carbon-icons-svelte/lib/PlayFilled.svelte';
  import Repeat from 'carbon-icons-svelte/lib/Repeat.svelte';
  import RepeatOne from 'carbon-icons-svelte/lib/RepeatOne.svelte';
  import RangeSlider from 'svelte-range-slider-pips';
  import { ParticleDataset } from '../datasets.js';
  import tooltip from '../tooltip.js';
  import { capitalizeFirstLetter } from '../utility.js';
  import prettyMilliseconds from 'pretty-ms';
  import { tick } from 'svelte';

  export let validDates;
  export let utc;

  export let griddedDataset;
  export let particleDataset;

  export let date;
  // used to enforce that updates to `date` from outside this component pause it
  export let sliding = false;
  export let fps = 5;

  $: dateOptions = {
    timeZone: utc ? 'UTC' : undefined,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  $: range = validDates[validDates.length - 1] - validDates[0];

  let playing = false;
  let loading = false;
  let controller;
  let originalParticleDataset = particleDataset;
  let timeoutID;
  let value = 0;
  let repeat = false;
  let syncingValueWithDate = false;

  $: date, handleDateUpdate();

  $: maxValue = validDates.length - 1;
  $: time = 1000 / (fps || 1);

  $: value, slideDate();
  $: validDates, particleDataset, pause();

  async function play() {
    originalParticleDataset = particleDataset;
    particleDataset = ParticleDataset.none;

    await tick();

    playing = true;
    loading = true;

    controller = new AbortController();
    let { signal } = controller;

    try {
      await Promise.all(validDates.map(d => {
        return griddedDataset.fetchData(d, signal);
      }));
    } catch {
      return;
    } finally {
      loading = false;
    }

    if (value >= maxValue || value < 0) value = 0;
    timeoutID = window.setTimeout(loopDate, time);
  }

  async function loopDate() {
    let t = time;
    value = value + 1;

    if (value === maxValue) t = 1000;
    if (value > maxValue) {
      value = 0;
      if (!repeat) {
        await tick();
        pause();
        return;
      }
    }

    timeoutID = window.setTimeout(loopDate, t);
  }

  function pause() {
    if (!playing) return;

    if (loading) controller.abort();

    window.clearTimeout(timeoutID);
    playing = false;
    particleDataset = originalParticleDataset;
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
    originalParticleDataset = particleDataset;
    particleDataset = ParticleDataset.none;
  }

  function handleStop() {
    particleDataset = originalParticleDataset;
  }
</script>

<div>
  <button
    class="play"
    on:click={playing ? pause : play}
    aria-label="Pause/play timelapse"
  >
    {#if playing}
      <Pause size={32} />
    {:else}
      <Play size={32} />
    {/if}
  </button>
  <h3>{capitalizeFirstLetter(griddedDataset.name)}</h3>
  <p>{prettyMilliseconds(range, {verbose: true})} starting on
  {validDates[0].toLocaleString([], dateOptions)}</p>
  <RangeSlider
    bind:value
    on:start={handleStart}
    on:stop={handleStop}
    min={0}
    max={validDates.length - 1}
    springValues={{ stiffness: 1, damping: 1 }}
    formatter={v => {
      const d = validDates[v];
      return d.toLocaleString([], { hour: 'numeric' });
    }}
    --range-range="var(--primary-color-light)"
    --range-pip="gray"
    --range-pip-active="gray"
    range="min" float pips
  />
  <button
    class="repeat"
    on:click={() => repeat = !repeat}
    use:tooltip={{ content: 'Toggle auto-repeat' }}
  >
    {#if repeat}
      <RepeatOne size={20} style="color: var(--primary-color-light" />
    {:else}
      <Repeat size={20} />
    {/if}
  </button>
</div>

<style>
  div {
    display: grid;
    grid-template-columns: 100px 1fr min-content;
    grid-template-rows: min-content 1fr min-content;
    margin-bottom: 0.5em;

    border-radius: 0.5em;
    background-color: var(--input-color);
  }

  button {
    all: unset;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  button.play {
    transition: filter 0.25s ease 0s;
    box-sizing: border-box;
    padding: 8px 16px;
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
    margin: 0.5rem 12px 0.25rem;
    font-size: 1rem;
  }

  p {
    font-size: 0.9rem;
    margin: 0 12px;
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
    height: 32px;
    width: 32px;
    margin: 4px 4px 4px 0;
  }

  button.repeat:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }

  button.repeat:focus {
    background-color: rgba(255, 255, 255, 0.15);
  }
</style>
