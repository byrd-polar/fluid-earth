<script>
  import Datepicker from 'svelte-calendar';
  import Button from '../components/Button.svelte';
  import RangeSlider from 'svelte-range-slider-pips';
  import prettyBytes from 'pretty-bytes';

  export let fetcher;
  export let inventory;
  export let date;
  export let griddedDataset;
  export let particleDataset;
  export let particlesShown;

  const dayInMilliseconds = 24 * 60 * 60 * 1000;

  $: start = inventory[griddedDataset].start;
  $: end = inventory[griddedDataset].end;

  $: interval = inventory[griddedDataset].intervalInHours;
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
  $: rangeGriddedBytes = rangeCount * inventory[griddedDataset].bytesPerFile;
  $: rangeParticleBytes = rangeCount *
    (2 * inventory[particleDataset].bytesPerFile);
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
      let datestr = d.toISOString();

      let path = griddedDataset + datestr + '.fp16';
      fetches.push(fetcher.fetch(path, 'range-loader', false));

      if (particlesShown) {
        let particleDatasetInfo = inventory[particleDataset];

        let uPath = particleDatasetInfo.uPath + datestr + '.fp16';
        let vPath = particleDatasetInfo.vPath + datestr + '.fp16';

        fetches.push(fetcher.fetch(uPath, 'range-loader', false));
        fetches.push(fetcher.fetch(vPath, 'range-loader', false));
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


<h2>Stepper</h2>

<p>Use the buttons below to move one step backward or forwards in time.</p>

<div style="display: flex">
  <Button
    action={() => adjustDate(-interval)}
    disabled={!canBack}
    secondary flex
  >
    -{interval} hours
  </Button>
  <Button
    action={() => adjustDate(interval)}
    disabled={!canForward}
    secondary flex
  >
    +{interval} hours
  </Button>
</div>


<h2>Calendar</h2>

<p>Use the button below to open a calendar. Select a date to see the earliest
dataset from that date.</p>

<Datepicker
  start={new Date(start)}
  end={new Date(end)}
  bind:selected
  style="display: block; width: max-content; margin: 2em auto"
  highlightColor="#015B5B"
>
  <Button>
    {date.toLocaleDateString(undefined, dateStringOptionsMore)}
  </Button>
</Datepicker>


<h2>Range Loader</h2>

<p>Select a range of dates to load data between.</p>
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

  <p>Confirm loading of the data, after which a slider will appear. Turning off
  streamlines will reduce size of the download.</p>
  <Button action={handleLoadButtonPress} full>
    {loading ? 'Cancel' : `Load Range (${prettyBytes(rangeBytes)})`}
  </Button>

{:else}

  <h2>Range Slider</h2>

  <p>Use the slider to scroll smoothly through time.</p>
  <RangeSlider
    min={rangeDatasetStart.getTime()}
    max={rangeDatasetEnd.getTime()}
    step={intervalInMilliseconds}
    springValues={{ stiffness: 0.15, damping: 1 }}
    bind:value={rangeValue}
    pips
  />

{/if}

<style>
  :global(div.sc-popover div.contents-wrapper) {
    z-index: 4 !important;
  }
</style>
