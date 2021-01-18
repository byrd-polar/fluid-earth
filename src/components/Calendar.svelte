<script>
  import flatpickr from "flatpickr";
  import 'flatpickr/dist/flatpickr.css'
  import 'flatpickr/dist/themes/dark.css'
  import tooltip from '../tooltip.js';
  import { onMount } from 'svelte';

  export let start;
  export let end;
  export let date;

  let inputElement;
  let picker;

  function clamp(x, min, max) {
    return x > max ? max : (x < min ? min : x);
  }

  onMount(() => {
    picker = flatpickr(inputElement, {
      inline: true,
      minDate: start,
      maxDate: end,
      onChange: dates => {
        dates[0].setHours(date.getHours());
        if (date - dates[0] !== 0) {
          date = clamp(dates[0], start, end);
        }
        // keep focus in calendar after selection
        setTimeout(() => {
          document.querySelector('span.flatpickr-day.selected').focus();
        }, 0);
      },
    });
    picker.setDate(date, true);
  });

  $: if (picker) picker.setDate(date);
</script>

<div>
  <input
    use:tooltip={{ content: 'ArrowDown to enter calendar', placement: 'top' }}
    bind:this={inputElement}
  />
</div>

<style>
  div {
    display: flex;
    flex-direction: column;
    align-items: center;
    user-select: none;
  }

  input {
    height: 0;
    padding: 0;
    border: none;
  }

  div :global(.flatpickr-calendar) {
    font-size: 1rem;
    border-radius: 0;
  }

  div :global(.flatpickr-month) {
    height: 3.5em;
  }

  div :global(.flatpickr-monthDropdown-months) {
    margin: 0.25em;
    text-align: center;
    text-align-last: center;
    width: 8em;
  }

  div :global(.flatpickr-months svg) {
    height: 1.5em;
    width: 1.5em;
  }

  div :global(.flatpickr-months .flatpickr-prev-month),
  div :global(.flatpickr-months .flatpickr-next-month) {
    padding: 1em;
  }

  div :global(.flatpickr-weekdays) {
    height: 2em;
  }

  div :global(.flatpickr-calendar),
  div :global(.flatpickr-days),
  div :global(.dayContainer) {
    width: 100%;
    max-width: unset;
    min-width: unset;
  }

  div :global(.flatpickr-day) {
    width: calc(100% / 7);
    max-width: unset;
    height: auto;
    display: flex;
    align-items: center;
    border-radius: 0;
  }

  div :global(.flatpickr-day::before) {
    content: '';
    float: left;
    padding-top: 100%;
  }

  div :global(.selected) {
    background-color: transparent;
  }

  div :global(.flatpickr-day.selected:focus),
  div :global(.flatpickr-day.selected:hover) {
    color: black;
  }
</style>
