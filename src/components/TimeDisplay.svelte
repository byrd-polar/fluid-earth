<script>
  import tooltip from '../tooltip.js';
  import { fix24 } from '../utility.js';

  export let date;
  export let utc;

  $: dateOptions = {
    timeZone: utc ? 'UTC' : undefined,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  $: timeOptions = {
    timeZone: utc ? 'UTC' : undefined,
    hour12: utc ? false : undefined,
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short',
  };

  function handleKeydown(e) {
    if (!(e.code === 'Space' || e.code === 'Enter')) return;

    utc = !utc
  }
</script>

<section
  on:click={() => utc = !utc}
  on:keydown={handleKeydown}
  use:tooltip={{ content: 'Change timezone', placement: 'bottom'}}
  tabindex="0"
>
  <h3 class="date">{date.toLocaleDateString(undefined, dateOptions)}</h3>
  <h3 class="time">
    {fix24(date.toLocaleTimeString(undefined, timeOptions))}
  </h3>
</section>

<style>
  section {
    cursor: pointer;
    border-radius: 4px;
    -webkit-tap-highlight-color: transparent;
    transition: background-color 0.25s ease 0s;
    margin-left: auto;
  }

  section:focus, section:hover {
    background-color: var(--input-color);
    outline: none;
  }

  section:focus:not(:focus-visible):not(:hover) {
    background-color: inherit;
  }

  h3 {
    text-align: right;
    font-size: 1.2em;
    padding: 0.25rem 0.75rem 0;
    margin: 0;
    pointer-events: auto;
    white-space: nowrap;
  }

  h3.time {
    padding-top: 0;
    font-weight: normal;
  }

  @media (max-width: 36rem) {
    h3 {
      font-size: 1em;
      padding: 0.5rem 0.75rem;
    }

    h3.date {
      padding: 0.5rem 0.75rem 0;
    }
  }
</style>
