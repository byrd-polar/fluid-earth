<script>
  import ChevronLeft32 from "carbon-icons-svelte/lib/ChevronLeft32";
  import ChevronRight32 from "carbon-icons-svelte/lib/ChevronRight32";
  import tooltip from '../tooltip.js';
  import { validDate } from '../utility.js';

  export let date;
  export let utc;
  export let griddedDataset;

  $: minDate = griddedDataset.start;
  $: maxDate = griddedDataset.end;

  $: month = utc ?
    new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth())) :
    new Date(date.getFullYear(), date.getMonth());
  $: prevMonth = utc ? getUTCMonth(month, -1) : getMonth(month, -1);
  $: nextMonth = utc ? getUTCMonth(month, +1) : getMonth(month, +1);

  $: months = utc ?
    deriveUTCMonths(minDate, maxDate) :
    deriveMonths(minDate, maxDate);
  $: days = utc ? deriveUTCDays(month) : deriveDays(month);

  $: monthOptions = {
    timeZone: utc ? 'UTC' : undefined,
    month: 'long',
    year: 'numeric',
  };

  $: sameTzDate = utc ? sameUTCDate : sameDate;
  $: setTzDate = utc ?  setUTCDate : setDate;

  function getMonth(month, offset) {
    let newMonth = clone(month);
    newMonth.setMonth(month.getMonth() + offset);
    return newMonth;
  }

  function deriveMonths(minDate, maxDate) {
    const months = [];
    let m = new Date(minDate.getFullYear(), minDate.getMonth());
    while (m <= new Date(maxDate.getFullYear(), maxDate.getMonth())) {
      months.push(m);
      m = clone(m);
      m.setMonth(m.getMonth() + 1);
    }
    return months;
  }

  function deriveDays(month) {
    const days = Array.from({ length: 42 }, () => clone(month));
    const offset = -month.getDay() + 1;
    for (let i = 0; i < days.length; i++) days[i].setDate(i + offset);
    return days;
  }

  function clone(dateObj) {
    return new Date(dateObj.getTime());
  }

  function sameDate(dateA, dateB) {
    return dateA.getFullYear() === dateB.getFullYear() &&
           dateA.getMonth()    === dateB.getMonth()    &&
           dateA.getDate()     === dateB.getDate();
  }

  function setDate(day) {
    // set date (e.g. 2021-01-01) while preserving time (e.g. 8:00am)
    date = getValidDate(day);
  }

  function getValidDate(day) {
    return validDate(griddedDataset, new Date(
      day.getFullYear(),
      day.getMonth(),
      day.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      date.getMilliseconds()
    ));
  }

  // UTC copies of functions above

  function getUTCMonth(month, offset) {
    let newMonth = clone(month);
    newMonth.setUTCMonth(month.getUTCMonth() + offset);
    return newMonth;
  }

  function deriveUTCMonths(minDate, maxDate) {
    const months = [];
    let m = new Date(Date.UTC(minDate.getUTCFullYear(), minDate.getUTCMonth()));
    while (m <= new Date(Date.UTC(maxDate.getUTCFullYear(), maxDate.getUTCMonth()))) {
      months.push(m);
      m = clone(m);
      m.setUTCMonth(m.getUTCMonth() + 1);
    }
    return months;
  }

  function deriveUTCDays(month) {
    const days = Array.from({ length: 42 }, () => clone(month));
    const offset = -month.getUTCDay() + 1;
    for (let i = 0; i < days.length; i++) days[i].setUTCDate(i + offset);
    return days;
  }

  function sameUTCDate(dateA, dateB) {
    return dateA.getUTCFullYear() === dateB.getUTCFullYear() &&
           dateA.getUTCMonth()    === dateB.getUTCMonth()    &&
           dateA.getUTCDate()     === dateB.getUTCDate();
  }

  function setUTCDate(day) {
    date = getValidUTCDate(day);
  }

  function getValidUTCDate(day) {
    return validDate(griddedDataset, new Date(Date.UTC(
      day.getUTCFullYear(),
      day.getUTCMonth(),
      day.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
      date.getUTCMilliseconds()
    )));
  }

  function validDay(day) {
    if (griddedDataset.intervalInHours <= 24) return true;

    return sameTzDate(day, utc ? getValidUTCDate(day) : getValidDate(day));
  }
</script>

<div class="calendar">
  <div class="header">
    <button
      on:click={() => month = prevMonth}
      disabled={!months.find(m => m.getTime() === prevMonth.getTime())}
      use:tooltip={{content: 'Prev month'}}
    >
      <ChevronLeft32 />
    </button>
    <div>
      {month.toLocaleString(undefined, monthOptions)}
    </div>
    <button
      on:click={() => month = nextMonth}
      disabled={!months.find(m => m.getTime() === nextMonth.getTime())}
      use:tooltip={{content: 'Next month'}}
    >
      <ChevronRight32 />
    </button>
  </div>
  <div class="days-of-week">
    {#each ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as dayOfWeek}
      <div>{dayOfWeek}</div>
    {/each}
  </div>
  {#each days as day}
    <button
      class="day"
      class:selected={sameTzDate(day, date)}
      class:not-in-month={
        utc ?
        day.getUTCMonth() !== month.getUTCMonth() :
        day.getMonth() !== month.getMonth()
      }
      on:click={() => { if (!sameTzDate(day, date)) setTzDate(day) }}
      disabled={
        sameTzDate(day, date) ||
        !validDay(day) ||
        (day < minDate || day > maxDate) &&
        !sameTzDate(day, minDate) &&
        !sameTzDate(day, maxDate)
      }
      use:tooltip={{content: 'Set date'}}
    >
      {utc ? day.getUTCDate() : day.getDate()}
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
    margin-top: 0.5em;
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

  button.day {
    background: var(--secondary-color-transparent);
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: inherit;
    cursor: pointer;
  }

  button.day.not-in-month {
    color: darkgrey;
  }

  button.day:disabled {
    filter: brightness(50%);
    background: var(--secondary-color-transparent);
    cursor: auto;
  }

  button.day.selected {
    filter: none;
    background: var(--primary-color-light);
  }

  button.day::before {
    content: '';
    float: left;
    padding-bottom: 100%;
  }
</style>
