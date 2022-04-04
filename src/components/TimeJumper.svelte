<script>
  import Button from './Button.svelte';
  import Time from 'carbon-icons-svelte/lib/Time.svelte';
  import Shuffle from 'carbon-icons-svelte/lib/Shuffle.svelte';
  import { validDate } from '../utility.js';
  import { currentDate } from '../stores.js';

  export let griddedDataset;
  export let date;

  $: nowDate = validDate(griddedDataset, $currentDate);

  function now() {
    date = nowDate;
  }

  function random() {
    date = validDate(griddedDataset, new Date(
      griddedDataset.start.getTime() +
      Math.random() * (griddedDataset.end - griddedDataset.start)
    ));
  }
</script>

<div>
  <Button action={now} disabled={date.getTime() === nowDate.getTime()} flex>
    <span>now</span><Time size={24} />
  </Button>
  <Button action={random} flex secondary>
    <span>random</span><Shuffle size={24} />
  </Button>
</div>

<style>
  div {
    display: flex;
  }

  div > :global(*) {
    margin-left: 2px;
  }

  div > :global(:first-child) {
    flex: 2;
  }

  span {
    margin-right: 0.5em;
  }
</style>
