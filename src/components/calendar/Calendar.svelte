<script>
  import LeftArrow from 'carbon-icons-svelte/lib/ChevronLeft32';
  import RightArrow from 'carbon-icons-svelte/lib/ChevronRight32';
  import ChipGroup from '../ChipGroup.svelte';
  import tooltip from '../../tooltip.js';
  import { validDate } from '../../utility.js';
  import { add, addUTC, subtract, subtractUTC } from './utility.js';
  import { tick } from 'svelte';

  import * as yearPicker from './yearPicker.js';
  import * as yearPickerUTC from './yearPickerUTC.js';
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
    years:  utc ? yearPickerUTC  : yearPicker,
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
    let opts = {
      preserveMonth: !utc && pickerMode === 'months',
      preserveUTCMonth: utc && pickerMode === 'months',
    };
    return validDate(griddedDataset, picker.selectedDate(boxDate, date), opts);
  }

  function getInfo(boxDate, headerDate, date, griddedDataset) {
    let wouldBeSelectedDate = selectedDate(boxDate, griddedDataset);
    return {
      boxDate,
      selected: picker.boxDateSelected(boxDate, date),
      enabled: picker.boxDateSelected(boxDate, wouldBeSelectedDate)
            && picker.boxDateEnabled(boxDate, headerDate),
    };
  }

  let focusHandler, calendar, hasFocus;

  async function handleFocus() {
    headerDate = picker.headerDate(date);
    await focusOnSelected();
  }

  $: updateFocusHandler(hasFocus);

  function updateFocusHandler(hasFocus) {
    if (!focusHandler) return;

    focusHandler.setAttribute('tabindex', hasFocus ? -1 : 0);
  }

  async function handleKeydown(e) {
    let newDate = keyToNewDate(e.key);
    if (!newDate) return;

    e.preventDefault();

    let opts = {
      preserveMonth: !utc && stuff, //TODO,
      preserveUTCMonth: utc && stuff, //TODO,
      excludedDate: date,
    };
    date = validDate(griddedDataset, newDate, opts);
    console.log(date);
    await focusOnSelected();
  }

  async function focusOnSelected() {
    await tick();
    calendar.querySelector('.selected').focus();
  }

  function keyToNewDate(key) {
    switch(key) {
      case 'ArrowLeft': return picker.prevBox(date);
      case 'ArrowRight': return picker.nextBox(date);
      case 'ArrowUp': return picker.prevRow(date);
      case 'ArrowDown': return picker.nextRow(date);
      case 'PageUp': return picker.prevPage(date);
      case 'PageDown': return picker.nextPage(date);
      default: return null;
    }
  }

  let width;
</script>

<ChipGroup {options} bind:selected={pickerMode} />

<div class="header">
  <button
    on:click={() => headerDate = prevHeaderDate}
    disabled={headerDate < griddedDataset.start}
    use:tooltip={{content: `Prev ${picker.headerUnit}`}}
    tabindex="-1"
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
    tabindex="-1"
  >
    <RightArrow />
  </button>
</div>

<div
  bind:this={focusHandler}
  on:focus={handleFocus}
  tabindex="0"
>
</div>

<div
  bind:clientWidth={width}
  class="calendar"
  style="
    --cols: {picker.boxDimensions[0]};
    --rows: {picker.boxDimensions[1]};
    --width: {width}px;
  "
  bind:this={calendar}
  on:focusin={() => hasFocus = true}
  on:focusout={() => hasFocus = false}
  on:keydown={handleKeydown}
>
  {#each boxDates.map(boxDate => {
    return getInfo(boxDate, headerDate, date, griddedDataset);
  }) as { boxDate, selected, enabled }, i (pickerMode + i)}
    <button
      class="box"
      class:hour={pickerMode === 'hours'}
      class:selected={selected && enabled}
      on:click={() => selectDate(boxDate)}
      disabled={!enabled}
      aria-label={`Set ${picker.boxUnit}`}
      tabindex="-1"
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

  div.header, div.calendar {
    font-size: 1.2em;
    overflow: hidden;
  }

  div.header {
    margin: 0.5em 0 1px;
    height: 3.8rem;
    background: var(--primary-color);
    display: flex;
    border-radius: 4px 4px 0 0;
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

  div.calendar {
    display: grid;
    grid-template-columns: repeat(var(--cols), 1fr);
    grid-template-rows: repeat(var(--rows), 1fr);
    height: calc(var(--width) * 6 / 7); /* square days */
    gap: 1px;
    border-radius: 0 0 4px 4px;
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

  button.box.hour {
    font-size: 16px;
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
