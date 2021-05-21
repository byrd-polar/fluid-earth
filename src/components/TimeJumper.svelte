<script>
  import Button from './Button.svelte';
  import Time24 from "carbon-icons-svelte/lib/Time24";
  import Shuffle24 from "carbon-icons-svelte/lib/Shuffle24";
  import { validDate } from '../utility.js';

  export let griddedDataset;
  export let date;

  function now() {
    date = validDate(griddedDataset, new Date());
  }

  function random() {
    date = validDate(griddedDataset, new Date(
      griddedDataset.start.getTime() +
      Math.random() * (griddedDataset.end - griddedDataset.start)
    ));
  }
</script>

<div>
  <Button action={now} flex>
    <span>now</span><Time24 />
  </Button>
  <Button action={random} flex secondary>
    <span>random</span><Shuffle24 />
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
