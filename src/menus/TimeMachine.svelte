<script>
  import Datepicker from 'svelte-calendar';
  import Button, { Group, Label } from '@smui/button';

  export let fetcher;
  export let inventory;
  export let date;
  export let dataset;

  let start, end;
  $: start = inventory[dataset].start;
  $: end = inventory[dataset].end;
  $: interval = inventory[dataset].intervalInHours;

  let canForward, canBack, interval;
  $: canForward = date < end;
  $: canBack = date > start;

  function adjustDate(hours) {
    date.setHours(date.getHours() + hours);
    date = date;
  }

  function localDateFloor(d) {
    return new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
    );
  }

  function datasetDateCeil(d) {
    let intervalInMilliseconds = interval * 60 * 60 * 1000;
    let intervalCount = Math.max(
      Math.ceil((d - start) / intervalInMilliseconds), 0
    );
    return new Date(start.getTime() + intervalInMilliseconds * intervalCount);
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
    hour: 'numeric',
  };
</script>


<h2>Stepper</h2>

<p>Use the buttons below to move one step backward or forwards in time.</p>

<Group variant="raised" style="display: flex">
  <Button
    variant="raised"
    color="secondary"
    style="flex: 1"
    on:click={() => adjustDate(-interval)}
    disabled={!canBack}
  >
    <Label>-{interval} hours</Label>
  </Button>
  <Button
    variant="raised"
    color="secondary"
    style="flex: 1; margin-left: 0.5em"
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
    <Label>{date.toLocaleDateString(undefined, dateStringOptions)}</Label>
  </Button>
</Datepicker>


<h2>About this menu</h2>

<p>Use the above controls to explore the current dataset at various points in
time.</p>


<style>
  /* Adjust disabled button style for dark background */
  :global(.mdc-button--raised:disabled) {
    background-color: rgba(0, 0, 0, 0.88);
    color: rgba(255, 255, 255, 0.58);
  }
</style>
