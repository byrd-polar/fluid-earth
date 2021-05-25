<script>
  import Button from './Button.svelte';
  import SkipBack32 from "carbon-icons-svelte/lib/SkipBack32";
  import ChevronLeft32 from "carbon-icons-svelte/lib/ChevronLeft32";
  import ChevronRight32 from "carbon-icons-svelte/lib/ChevronRight32";
  import SkipForward32 from "carbon-icons-svelte/lib/SkipForward32";
  import { validOscarDates, fix24 } from '../utility.js';
  import prettyMilliseconds from 'pretty-ms';

  export let dataset;
  export let date;
  export let utc;

  $: timeOptions = {
    timeZone: utc ? 'UTC' : undefined,
    hour12: utc ? false : undefined,
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short',
  };

  $: validDates = getValidDates(dataset);
  $: currentIndex = validDates.findIndex(d => d.getTime() === date.getTime());

  function getValidDates(dataset) {
    const dates = [];

    if (dataset.intervalInHours === 'custom:OSCAR') {
      let year = dataset.start.getUTCFullYear(); 
      while (year <= dataset.end.getUTCFullYear()) {
        dates.push(...validOscarDates(year));
        year++;
      }
      return dates.filter(d => d >= dataset.start && d <= dataset.end);
    }

    let t = dataset.start.getTime();
    while (t <= dataset.end.getTime()) {
      dates.push(new Date(t));
      t += dataset.intervalInHours * 60 * 60 * 1000;
    }
    return dates;
  }

  function stepDate(steps) {
    date = validDates[currentIndex + steps];
  }

  function prettyStepSize(dates, index, steps) {
    let tDiff = dates[index + steps] - dates[index];
    if (Number.isNaN(tDiff)) return '';

    return prettyMilliseconds(tDiff, {verbose: true});
  }

  const bigStep = 6;
  const smolStep = 1;
</script>

<div>
  <Button
    action={() => stepDate(-bigStep)}
    disabled={currentIndex - bigStep < 0}
    tip={prettyStepSize(validDates, currentIndex, -bigStep)}
    flex
  >
    <SkipBack32 />
  </Button>
  <Button
    action={() => stepDate(-smolStep)}
    disabled={currentIndex - smolStep < 0}
    tip={prettyStepSize(validDates, currentIndex, -smolStep)}
    flex secondary
  >
    <ChevronLeft32 />
  </Button>
  <span>
    {fix24(date.toLocaleTimeString(undefined, timeOptions))}
  </span>
  <Button
    action={() => stepDate(smolStep)}
    disabled={currentIndex + smolStep >= validDates.length}
    tip={prettyStepSize(validDates, currentIndex, smolStep)}
    flex secondary
  >
    <ChevronRight32 />
  </Button>
  <Button
    action={() => stepDate(bigStep)}
    disabled={currentIndex + bigStep >= validDates.length}
    tip={prettyStepSize(validDates, currentIndex, bigStep)}
    flex
  >
    <SkipForward32 />
  </Button>
</div>

<style>
  div {
    display: flex;
  }

  div > :global(*) {
    margin-left: 2px;
  }

  span {
    width: 8em;
    font-size: 1.2em;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
  }
</style>
