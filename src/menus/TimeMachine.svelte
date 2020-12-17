<script>
  import Datepicker from 'svelte-calendar';
  import Button, { Group, Label } from '@smui/button';
  import RangeSlider from 'svelte-range-slider-pips';
  import prettyBytes from 'pretty-bytes';

  export let fetcher;
  export let inventory;
  export let date;
  export let dataset;
  export let particlesShown;

  const dayInMilliseconds = 24 * 60 * 60 * 1000;

  $: start = inventory[dataset].start;
  $: end = inventory[dataset].end;

  $: interval = inventory[dataset].intervalInHours;
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
  $: rangeGriddedBytes = rangeCount * inventory[dataset].bytesPerFile;
  $: rangeParticleBytes = rangeCount *
    (inventory['/data/gfs-0p25-u-wind-velocity-10m/'].bytesPerFile +
     inventory['/data/gfs-0p25-v-wind-velocity-10m/'].bytesPerFile);
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
      let dstr = d.toISOString();

      let path = dataset + dstr + '.fp16';
      fetches.push(fetcher.fetch(path, 'range-loader', false));

      if (particlesShown) {
        let uPath = `/data/gfs-0p25-u-wind-velocity-10m/${dstr}.fp16`;
        let vPath = `/data/gfs-0p25-v-wind-velocity-10m/${dstr}.fp16`;
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

  $: rangeStart, rangeEnd, dataset, particlesShown, loaded = false;

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

<Group variant="raised" style="display: flex">
  <Button
    variant="raised"
    color="secondary"
    class="stepper-btn"
    on:click={() => adjustDate(-interval)}
    disabled={!canBack}
    ripple
  >
    <Label>-{interval} hours</Label>
  </Button>
  <Button
    variant="raised"
    color="secondary"
    class="stepper-btn right"
    on:click={() => adjustDate(interval)}
    disabled={!canForward}
  >
    <Label>+{interval} hours</Label>
  </Button>
</Group>


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
  <Button variant="raised">
    <Label>{date.toLocaleDateString(undefined, dateStringOptionsMore)}</Label>
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
  <Button variant="raised" color="secondary">
    <Label>{rangeStart.toLocaleDateString(undefined, dateStringOptions)}</Label>
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
  <Button variant="raised" color="secondary">
    <Label>{rangeEnd.toLocaleDateString(undefined, dateStringOptions)}</Label>
  </Button>
</Datepicker>

{#if !loaded }

  <p>Confirm loading of the data, after which a slider will appear. Turning off
  streamlines will reduce size of the download.</p>
  <Button variant="raised" class="load-btn" on:click={handleLoadButtonPress}>
    <Label>
      {loading ? 'Cancel' : `Load Range (${prettyBytes(rangeBytes)})`}
    </Label>
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
  /* Adjust disabled button style for dark background */
  :global(.mdc-button--raised:disabled) {
    background-color: rgba(0, 0, 0, 0.88);
    color: rgba(255, 255, 255, 0.58);
  }

  :global(.stepper-btn) {
    flex: 1;
  }

  :global(.stepper-btn.right) {
    margin-left: 0.5em;
  }

  :global(.load-btn) {
    width: 100%;
  }
</style>
