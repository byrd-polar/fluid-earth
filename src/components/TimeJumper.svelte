<script>
  import Button from './Button.svelte';
  import Time from 'carbon-icons-svelte/lib/Time.svelte';
  import Shuffle from 'carbon-icons-svelte/lib/Shuffle.svelte';
  import { currentDate } from '../stores.js';

  export let timeDataset;
  export let date;

  $: nowDate = timeDataset.closestValidDate($currentDate);

  function now() {
    date = nowDate;
  }

  function random() {
    date = timeDataset.closestValidDate(new Date(
      timeDataset.start.getTime() +
      Math.random() * (timeDataset.end - timeDataset.start)
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
    flex: 1;
  }

  div :global(svg) {
    margin-left: 0.5em;
    flex-shrink: 0;
  }
</style>
