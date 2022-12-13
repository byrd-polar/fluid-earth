<script>
  import tooltip from '../tooltip.js';
  import { handleLikeButton } from '../utility.js';

  export let displayedDate;
  export let displayedTimeDataset;
  export let utc;

  $: interval = displayedTimeDataset.interval;
  $: utcOnly = interval.utcOnly;
  $: enforceUtcOnly(utcOnly);

  let _utc;

  function enforceUtcOnly(utcOnly) {
    if (utcOnly) {
      _utc = utc;
      utc = true;
    } else {
      utc = _utc;
    }
  }

  function toggleUtc() {
    if (!utcOnly) utc = !utc;
  }
</script>

<section
  on:click={toggleUtc}
  on:keydown={handleLikeButton(toggleUtc)}
  class:canchange={!utcOnly}
  use:tooltip={{
    content: utcOnly ? 'No alternate timezones available' : 'Change timezone',
    placement: 'bottom',
  }}
  role="button"
  tabindex="0"
>
  <h3 class="date">{interval.dateFormat(displayedDate, utc)}</h3>
  {#if interval.timeFormat}
    <h3 class="time">{interval.timeFormat(displayedDate, utc)}</h3>
  {/if}
</section>

<style>
  section {
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

  section.canchange {
    cursor: pointer;
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
