<script>
  import ChevronLeft from 'carbon-icons-svelte/lib/ChevronLeft.svelte';
  import ChevronRight from 'carbon-icons-svelte/lib/ChevronRight.svelte';
  import ChipGroup from '../ChipGroup.svelte';
  import { ZonedDateTime, multiply } from '../../temporal.js';
  import { tick } from 'svelte';

  import * as yearPicker from './yearPicker.js';
  import * as monthPicker from './monthPicker.js';
  import * as dayPicker from './dayPicker.js';
  import * as hourPicker from './hourPicker.js';

  export let date;
  export let timeDataset;
  export let utc;

  let pickerMode = 'day';
  let pickers = {
    year: yearPicker,
    month: monthPicker,
    day: dayPicker,
    hour: hourPicker,
  };
  $: options = getOptions(timeDataset.interval);
  $: if (!options.includes(pickerMode)) {
    pickerMode = options[options.length - 1];
  }
  $: picker = pickers[pickerMode];

  function getOptions(interval) {
    let all = Object.keys(pickers);
    let index = all.findIndex(p => p === interval.smallestPickerMode);
    return all.slice(0, index + 1);
  }

  $: zdt = new ZonedDateTime(date, utc);

  let header;
  $: updateHeader(zdt, picker);
  $: prevHeader = header.subtract(picker.headerInterval);
  $: nextHeader = header.add(picker.headerInterval);

  $: length = picker.boxDimensions.reduce((x, y) => x * y);
  $: base = picker.boxOffset ? header.add(picker.boxOffset(header)) : header;
  $: boxGenFn = (_, i) => base.add(multiply(picker.boxInterval, i));
  $: boxes = Array.from({length}, boxGenFn);
  $: selectedBox = zdt.round(picker.boxSelectedRoundTo);

  function updateHeader(zdt, picker) {
    let newHeader = zdt.round(picker.headerRoundTo);
    if (header?.equals(newHeader)) return;

    header = newHeader;
  }

  function selectDate(box) {
    let d = Object.fromEntries(picker.boxSelect.map(unit => [unit, box[unit]]));
    let v = date => date >= box.date && date < box.add(picker.boxInterval).date;
    let validDate = timeDataset.closestValidDate(zdt.with(d).date, v);
    if (validDate) date = validDate;
  }

  function boxIsEnabled(box, timeDataset, utc, picker, header) {
    if (!picker.boxEnabled(box, header)) return false;
    if (box.date > timeDataset.end) return false;

    let a = timeDataset.closestValidDate(box.date, date => date >= box.date);
    if (!a) return false;

    let b = new ZonedDateTime(a, utc).subtract(picker.boxInterval);
    return b.date < box.date;
  }

  function format(box, formatter, utc) {
    if (typeof formatter === 'function') return formatter(box, utc);

    return box.date.toLocaleString([], {
      timeZone: utc ? 'UTC' : undefined,
      ...formatter,
    });
  }

  let calendar, hasFocus;

  function handleFocus() {
    updateHeader(zdt, picker); // ensure selected box is visible
    focusOnSelected();
  }

  function handleKeydown(e) {
    let duration, mathFn, condition;

    if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
      duration = picker.boxInterval;
    } else if (['ArrowUp', 'ArrowDown'].includes(e.key)) {
      duration = multiply(picker.boxInterval, picker.boxDimensions[0]);
    } else if (['PageUp', 'PageDown'].includes(e.key)) {
      duration = picker.headerInterval;
    }

    if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) {
      mathFn = 'subtract';
      condition = d => d < date;
    } else if (['ArrowRight', 'ArrowDown', 'PageDown'].includes(e.key)) {
      mathFn = 'add';
      condition = d => d > date;
    }

    if (!(duration && mathFn)) return;

    e.preventDefault();

    let newDate = zdt[mathFn](duration).date;
    let validDate = timeDataset.closestValidDate(newDate, condition);
    if (validDate) date = validDate;

    focusOnSelected();
  }

  async function focusOnSelected() {
    await tick();
    calendar.querySelector('.selected').focus();
  }

  let width;
</script>

<ChipGroup {options} bind:selected={pickerMode} nowrap={true} />

<div class="header">
  <button
    on:click={() => header = prevHeader}
    disabled={header.date <= timeDataset.start}
    aria-label={`Prev ${picker.headerUnit}`}
    tabindex="-1"
  >
    <ChevronLeft size={32} />
  </button>
  <div>
    {format(header, picker.headerFormat, utc)}
  </div>
  <button
    on:click={() => header = nextHeader}
    disabled={nextHeader.date > timeDataset.end}
    aria-label={`Next ${picker.headerUnit}`}
    tabindex="-1"
  >
    <ChevronRight size={32} />
  </button>
</div>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<div
  on:focus={handleFocus}
  tabindex={hasFocus ? -1 : 0}
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
>
  {#each boxes as box, i (pickerMode + i)}
    {@const selected = box.equals(selectedBox)}
    {@const enabled = boxIsEnabled(box, timeDataset, utc, picker, header)}
    <button
      class="box"
      class:hour={pickerMode === 'hour'}
      class:selected={selected && enabled}
      on:click={() => { if (!selected) selectDate(box) }}
      on:keydown={handleKeydown}
      disabled={!enabled}
      tabindex={selected ? 0 : -1}
    >
      {format(box, picker.boxFormat, utc)}
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
    margin-bottom: 1px;
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
    text-align: center;
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
    min-height: calc(var(--width) * 6 / 7); /* square days */
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
    white-space: nowrap;
    overflow: hidden;
  }

  button.box.hour {
    font-size: 1rem;
  }

  button.box:disabled {
    filter: brightness(50%);
    background: var(--secondary-color-transparent);
    cursor: auto;
  }

  button.box.selected {
    background: var(--primary-color);
    border: solid 2px var(--primary-color-light);
  }
</style>
