<script>
  import LeftArrow from 'carbon-icons-svelte/lib/ChevronLeft32';
  import RightArrow from 'carbon-icons-svelte/lib/ChevronRight32';
  import ChipGroup from '../ChipGroup.svelte';
  import tooltip from '../../tooltip.js';
  import { validDate } from '../../utility.js';

  import * as monthPicker from './monthPicker.js';
  import * as monthPickerUTC from './monthPickerUTC.js';
  import * as dayPicker from './dayPicker.js';
  import * as dayPickerUTC from './dayPickerUTC.js';
  import * as hourPicker from './hourPicker.js';
  import * as hourPickerUTC from './hourPickerUTC.js';

  export let date;
  export let griddedDataset;
  export let utc;

  let pickerMode = 'days';
  $: pickers = {
    months: utc ? monthPickerUTC : monthPicker,
    days:   utc ? dayPickerUTC   : dayPicker,
    hours:  utc ? hourPickerUTC  : hourPicker,
  };
  $: options = Object.keys(pickers);

  $: picker = pickers[pickerMode];

  $: headerDate = picker.headerDate(date);
  $: prevHeaderDate = picker.prevHeaderDate(headerDate);
  $: nextHeaderDate = picker.nextHeaderDate(headerDate);

  $: boxDates = picker.boxDates(headerDate);

  function selectDate(boxDate) {
    if (picker.boxDateSelected(boxDate, date)) return;

    date = selectedDate(boxDate, griddedDataset);
  }

  function selectedDate(boxDate, griddedDataset) {
    return validDate(
      griddedDataset,
      picker.selectedDate(boxDate, date),
    );
  }

  function boxDateEnabled(boxDate, griddedDataset) {
    let wouldBeSelectedDate = selectedDate(boxDate, griddedDataset);
    return picker.boxDateSelected(boxDate, wouldBeSelectedDate) &&
           picker.boxDateEnabled(boxDate, headerDate);
  }

  let width;
</script>

<ChipGroup {options} bind:selected={pickerMode} />

<div
  bind:clientWidth={width}
  class="calendar"
  style="
    --cols: {picker.boxDimensions[0]};
    --rows: {picker.boxDimensions[1]};
    --width: {width}px;
  "
>
  <div class="header">
    <button
      on:click={() => headerDate = prevHeaderDate}
      disabled={headerDate < griddedDataset.start}
      use:tooltip={{content: `Prev ${picker.headerUnit}`}}
    >
      <LeftArrow />
    </button>
    <div>
      {picker.formatHeader(headerDate)}
    </div>
    <button
      on:click={() => headerDate = nextHeaderDate}
      disabled={nextHeaderDate > griddedDataset.end}
      use:tooltip={{content: `Next ${picker.headerUnit}`}}
    >
      <RightArrow />
    </button>
  </div>
  {#each boxDates as boxDate, i (pickerMode + i)}
    <button
      class="box"
      class:selected={picker.boxDateSelected(boxDate, date)}
      on:click={() => selectDate(boxDate)}
      disabled={!boxDateEnabled(boxDate, griddedDataset)}
      use:tooltip={{content: `Set ${picker.boxUnit}`}}
    >
      {picker.formatBox(boxDate)}
    </button>
  {/each}
</div>

<style>
  button {
    transition: filter 0.25s ease 0s;
    margin: 0;
    border: 0;
    outline: none;
    color: white;
  }

  button:focus, button:hover {
    filter: brightness(125%);
  }

  div.calendar {
    --header-height: 3.8rem;
    margin-top: 0.5em;
    display: grid;
    grid-template-columns: repeat(var(--cols), 1fr);
    grid-template-rows: var(--header-height) repeat(var(--rows), 1fr);
    height: calc(var(--header-height) + var(--width) * 6 / 7); /* square days */
    gap: 1px;
    font-size: 1.2em;
    border-radius: 4px;
    overflow: hidden;
  }

  div.header {
    height: var(--header-height);
    grid-column-start: span var(--cols);
    background: var(--primary-color);
    display: flex;
  }

  div.header::before {
    content: '';
    float: left;
    padding-bottom: 15%;
  }

  div.header div {
    flex: 4;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  div.header button {
    flex: 1;
    background: inherit;
    cursor: pointer;
  }

  div.header button:disabled {
    color: grey;
    filter: none;
    cursor: auto;
  }

  button.box {
    background: var(--secondary-color-transparent);
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: inherit;
    cursor: pointer;
  }

  button.box:disabled {
    filter: brightness(50%);
    background: var(--secondary-color-transparent);
    cursor: auto;
  }

  button.box.selected {
    filter: none;
    background: var(--primary-color-light);
  }
</style>
