<script>
  import Datepicker from 'svelte-calendar';
  import Button from '../components/Button.svelte';
  import RangeSlider from 'svelte-range-slider-pips';
  import Toggle from "svelte-toggle";
  import tooltip from '../tooltip.js';
  import prettyBytes from 'pretty-bytes';

  export let fetcher;
  export let date;
  export let griddedDataset;
  export let particleDataset;
  export let particlesShown;
  export let detailedMenus;

  const dayInMilliseconds = 24 * 60 * 60 * 1000;

  $: start = griddedDataset.start;
  $: end = griddedDataset.end;

  $: interval = griddedDataset.intervalInHours;
  $: intervalInMilliseconds = interval * 60 * 60 * 1000;

  $: canForward = date < end;
  $: canBack = date > start;

  function adjustDate(hours) {
    date.setHours(date.getHours() + hours);
    date = date;
  }

  function clamp(x, min, max) {
    return x > max ? max : (x < min ? min : x);
  }

  function localDateFloor(d) {
    return new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
    );
  }

  function datasetDateCeil(d) {
    let intervalCount = Math.ceil((d - start) / intervalInMilliseconds);
    d = new Date(start.getTime() + intervalInMilliseconds * intervalCount);
    return clamp(d, start, end);
  }

  let selected;
  $: date, updateSelected();
  $: selected, updateDate();

  function updateSelected() {
    let floor = localDateFloor(date);
    if (selected === undefined || selected.getTime() !== floor.getTime()) {
      selected = floor;
    }
  }

  function updateDate() {
    let floor = localDateFloor(date);
    if (selected.getTime() !== floor.getTime()) {
      date = datasetDateCeil(selected);
    }
  }

  const dateStringOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  const dateStringOptionsMore = {
    ...dateStringOptions,
    hour: 'numeric',
  };

  function localDateCeil(d) {
    return new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate() + 1,
    );
  }

  let rangeStart = localDateFloor(date);
  let rangeEnd = localDateCeil(date);

  $: rangeStartPlusOne = new Date(rangeStart.getTime() + dayInMilliseconds);
  $: rangeEndMinusOne = new Date(rangeEnd.getTime() - dayInMilliseconds);

  $: rangeDatasetStart = datasetDateCeil(rangeStart);
  $: rangeDatasetEnd = datasetDateCeil(rangeEnd);
  $: rangeCount = (rangeDatasetEnd - rangeDatasetStart) / intervalInMilliseconds;
  $: rangeGriddedBytes = rangeCount * griddedDataset.bytesPerFile;
  $: rangeParticleBytes = rangeCount * (2 * particleDataset.bytesPerFile);
  $: rangeBytes = rangeGriddedBytes + (particlesShown ? rangeParticleBytes : 0);


  let loaded = false;
  let loading = false;

  async function handleLoadButtonPress() {
    if (loading) {
      fetcher.abort('range-loader');
      return;
    }

    loading = true;

    let fetches = [];
    let d = datasetDateCeil(rangeStart);

    while (d <= datasetDateCeil(rangeEnd)) {
      fetches.push(fetcher.fetch(griddedDataset, d, 'range-loader', false));

      if (particlesShown) {
        fetches.push(fetcher.fetch(particleDataset, d, 'range-loader', false));
      }

      d = new Date(d.getTime() + intervalInMilliseconds);
    }
    let results = await Promise.all(fetches);
    loading = false;

    if (results.every(r => r)) {
      loaded = true;
      date = datasetDateCeil(rangeStart);
    }
  }

  $: rangeStart, rangeEnd, griddedDataset, particleDataset, particlesShown,
    loaded = false;

  let rangeValue = date.getTime();
  function updateRangeValue() {
    let time = clamp(date, rangeDatasetStart, rangeDatasetEnd).getTime();
    if (rangeValue !== time) {
      rangeValue = time;
    }
  }
  $: date = new Date(rangeValue);
  $: date, rangeDatasetStart, rangeDatasetEnd, updateRangeValue();
</script>

<Toggle
  bind:toggled={detailedMenus}
  label=""
  toggledColor="#676778"
  on="Detailed"
  off="Simple"
  style="margin-left: auto"
/>

<h2>Change the date/time</h2>

<div use:tooltip={{content: "Select a date, or go back and forward a few hours at a time."}}>
  <Datepicker
    start={new Date(start)}
    end={new Date(end)}
    bind:selected
    style="display: block; width: max-content; margin: 1em auto"
    highlightColor="#015B5B"
  >
    <Button full>
      {date.toLocaleDateString(undefined, dateStringOptionsMore)}
    </Button>
  </Datepicker>

  <div style="display: flex">
    <Button
      action={() => adjustDate(-interval)}
      disabled={!canBack}
      secondary flex
    >
      - {interval} hours
    </Button>
    <Button
      action={() => adjustDate(interval)}
      disabled={!canForward}
      secondary flex
    >
      + {interval} hours
    </Button>
  </div>
</div>
<br>


{#if !loaded }
  <h2>Pre-load dates</h2>
{:else}
  <h2>Scroll dates</h2>
{/if}

<div use:tooltip={{content: "Pick a start and end date, then click \"Load Range\". A slider will appear, allowing you to smooth-scroll across those dates."}}>
  <Datepicker
    start={new Date(start)}
    end={rangeEndMinusOne}
    bind:selected={rangeStart}
    style="display: block; width: max-content; margin: 1em auto 0"
    highlightColor="#676778"
  >
    <Button secondary>
      {rangeStart.toLocaleDateString(undefined, dateStringOptions)}
    </Button>
  </Datepicker>

  <p style="text-align: center; margin: 0.1em">to</p>

  <Datepicker
    start={rangeStartPlusOne}
    end={localDateCeil(end)}
    bind:selected={rangeEnd}
    style="display: block; width: max-content; margin: 0 auto 1em"
    highlightColor="#676778"
  >
    <Button secondary>
      {rangeEnd.toLocaleDateString(undefined, dateStringOptions)}
    </Button>
  </Datepicker>


  {#if !loaded }

    <Button action={handleLoadButtonPress} full>
      {loading ? 'Cancel' : `Load Range (${prettyBytes(rangeBytes)})`}
    </Button>

  {:else}

    <RangeSlider
      min={rangeDatasetStart.getTime()}
      max={rangeDatasetEnd.getTime()}
      step={intervalInMilliseconds}
      springValues={{ stiffness: 0.15, damping: 1 }}
      bind:value={rangeValue}
      pips
    />

  {/if}
</div>
<br>

{#if detailedMenus}
  <h2>Settings</h2>

  <div use:tooltip={{content: "Disable animated streamlines to reduce download size."}}>
    <Toggle
      bind:toggled={particlesShown}
      label="Streamlines"
      toggledColor="#676778"
      on="Enabled (larger download size)"
      off="Disabled (smaller download size)"
      style="order: 2; margin-left: auto"
    />
  </div>
{/if}



<style>
  :global(div.sc-popover div.contents-wrapper) {
    z-index: 4 !important;
  }
</style>
