<script>
  import LeftArrow from 'carbon-icons-svelte/lib/ChevronLeft32';
  import RightArrow from 'carbon-icons-svelte/lib/ChevronRight32';
  import tooltip from '../../tooltip.js';
  import { validDate } from '../../utility.js';

  import * as dayPicker from './dayPicker.js';
  import * as dayPickerUTC from './dayPickerUTC.js';

  export let date;
  export let griddedDataset;
  export let utc;

  $: picker = utc ? dayPickerUTC : dayPicker;

  $: headerDate = picker.headerDate(date);
  $: prevHeaderDate = picker.prevHeaderDate(headerDate);
  $: nextHeaderDate = picker.nextHeaderDate(headerDate);

  $: boxDates = picker.boxDates(headerDate);

  function selectDate(boxDate) {
    if (picker.boxDateSelected(boxDate, date)) return;

    date = selectedDate(boxDate);
  }

  function selectedDate(boxDate) {
    return validDate(
      griddedDataset,
      picker.selectedDate(boxDate, date),
    );
  }

  function boxDateEnabled(boxDate) {
    return picker.boxDateSelected(boxDate, selectedDate(boxDate)) &&
           picker.boxDateEnabled(boxDate, headerDate);
  }
</script>

<div class="calendar">
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
  {#each boxDates as boxDate}
    <button
      class="box"
      class:selected={picker.boxDateSelected(boxDate, date)}
      on:click={() => selectDate(boxDate)}
      disabled={!boxDateEnabled(boxDate)}
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
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 1px;
    font-size: 1.2em;
    border-radius: 4px;
    overflow: hidden;
  }

  div.header {
    grid-column-start: span 7;
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

  div.days-of-week {
    grid-column-start: span 7;
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 1px;
    background: var(--primary-color);
  }

  div.days-of-week > div {
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 2em;
    font-size: 0.8em;
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

  button.box::before {
    content: '';
    float: left;
    padding-bottom: 100%;
  }
</style>
