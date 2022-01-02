<script>
  import LeftArrow from 'carbon-icons-svelte/lib/ChevronLeft32';
  import RightArrow from 'carbon-icons-svelte/lib/ChevronRight32';
  import ChipGroup from '../ChipGroup.svelte';
  import tooltip from '../../tooltip.js';
  import { validDate } from '../../utility.js';
  import { ZonedDateTime, multiply } from './miniTemporal.js';
  import { tick } from 'svelte';

  import * as yearPicker from './yearPicker.js';
  import * as monthPicker from './monthPicker.js';
  import * as dayPicker from './dayPicker.js';
  import * as hourPicker from './hourPicker.js';

  export let date;
  export let griddedDataset;
  export let utc;

  let pickerMode = 'days';
  $: pickers = {
    years: yearPicker,
    months: monthPicker,
    days: dayPicker,
    hours: hourPicker,
  };
  $: options = Object.keys(pickers);

  $: picker = pickers[pickerMode];

  $: header = new ZonedDateTime(date, utc).round(picker.headerRoundTo);
  $: prevHeader = header.subtract(picker.headerInterval);
  $: nextHeader = header.add(picker.headerInterval);

  $: length = picker.boxDimensions.reduce((x, y) => x * y);
  $: boxes = getBoxes(header);

  function getBoxes(header) {
    return Array.from({length}, (_, i) => {
      let base = header;
      if (picker.boxOffset) base = header.add(picker.boxOffset(header));

      return base.add(multiply(picker.boxInterval, i));
    });
  }

  function selectDate(box) {
    date = selectedDate(box, griddedDataset);
  }

  function selectedDate(box, griddedDataset) {
    let blend = new ZonedDateTime(date, utc).with(Object.fromEntries(
      picker.boxSelect.map(unit => [unit, box[unit]]))).date;

    let opts = {
      preserveMonth: !utc && pickerMode === 'months',
      preserveUTCMonth: utc && pickerMode === 'months',
    };

    return validDate(griddedDataset, blend, opts);
  }

  function isSelectedIf(box, date) {
    return box.equals(
      new ZonedDateTime(date, utc).round(picker.boxSelectedRoundTo));
  }

  function getInfo(box, header, date, griddedDataset) {
    let selected = isSelectedIf(box, date);
    let enabled = isSelectedIf(box, selectedDate(box, griddedDataset))
               && picker.boxEnabled(box, header);

    return { box, selected, enabled };
  }

  function format(dt, formatter) {
    if (typeof formatter === 'function') return formatter(dt, utc);

    return dt.date.toLocaleString([], {
      timeZone: utc ? 'UTC' : undefined,
      ...formatter,
    });
  }

  let focusHandler, calendar, hasFocus;

  async function handleFocus() {
    date = date; // refresh header and boxes so that selected box is visible
    await focusOnSelected();
  }

  $: updateFocusHandler(hasFocus);

  function updateFocusHandler(hasFocus) {
    if (!focusHandler) return;

    focusHandler.setAttribute('tabindex', hasFocus ? -1 : 0);
  }

  async function handleKeydown(e) {
    let duration, mathFn;

    if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
      duration = picker.boxInterval;
    } else if (['ArrowUp', 'ArrowDown'].includes(e.key)) {
      duration = multiply(picker.boxInterval, picker.boxDimensions[0]);
    } else if (['PageUp', 'PageDown'].includes(e.key)) {
      duration = picker.headerInterval;
    }

    if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) {
      mathFn = 'subtract';
    } else if (['ArrowRight', 'ArrowDown', 'PageDown'].includes(e.key)) {
      mathFn = 'add';
    }

    if (!(duration && mathFn)) return;

    e.preventDefault();

    let newDate = new ZonedDateTime(date, utc)[mathFn](duration).date;
    let preserveMonth = duration['months'] || duration['years'];
    let opts = {
      preserveMonth: !utc && preserveMonth,
      preserveUTCMonth: utc && preserveMonth,
      excludedDate: date,
    };

    date = validDate(griddedDataset, newDate, opts);
    await focusOnSelected();
  }

  async function focusOnSelected() {
    await tick();
    calendar.querySelector('.selected').focus();
  }

  let width;
</script>

<ChipGroup {options} bind:selected={pickerMode} />

<div class="header">
  <button
    on:click={() => header = prevHeader}
    disabled={header.date < griddedDataset.start}
    use:tooltip={{content: `Prev ${picker.headerUnit}`}}
    tabindex="-1"
  >
    <LeftArrow />
  </button>
  <div>
    {format(header, picker.headerFormat)}
  </div>
  <button
    on:click={() => header = nextHeader}
    disabled={nextHeader.date > griddedDataset.end}
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
  {#each boxes.map(box => getInfo(box, header, date, griddedDataset))
      as { box, selected, enabled }, i (pickerMode + i)}
    <button
      class="box"
      class:hour={pickerMode === 'hours'}
      class:selected={selected && enabled}
      on:click={() => { if (!selected) selectDate(box) }}
      disabled={!enabled}
      tabindex="-1"
    >
      {format(box, picker.boxFormat)}
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
