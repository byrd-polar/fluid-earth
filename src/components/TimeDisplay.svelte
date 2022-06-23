<script>
  import tooltip from '../tooltip.js';
  import { fix24, handleLikeButton } from '../utility.js';

  export let displayDate;
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

  function toggleUtc() {
    utc = !utc;
  }
</script>

<section
  on:click={toggleUtc}
  on:keydown={handleLikeButton(toggleUtc)}
  use:tooltip={{ content: 'Change timezone', placement: 'bottom'}}
  tabindex="0"
>
  <h3 class="date">{displayDate.toLocaleString([], dateOptions)}</h3>
  <h3 class="time">
    {fix24(displayDate.toLocaleString([], timeOptions))}
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

  @media (max-width: 576px) {
    h3 {
      font-size: 1em;
      padding: 0.5rem 0.75rem;
    }

    h3.date {
      padding: 0.5rem 0.75rem 0;
    }
  }
</style>
