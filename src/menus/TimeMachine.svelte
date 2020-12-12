<script>
  import Datepicker from 'svelte-calendar';

  export let fetcher;
  export let inventory;
  export let date;
  export let dataset;

  let start, end;
  $: start = inventory[dataset].start;
  $: end = inventory[dataset].end;
  $: interval = inventory[dataset].intervalInHours;

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
</script>

<Datepicker
  start={new Date(start)}
  end={new Date(end)}
  bind:selected
/>
