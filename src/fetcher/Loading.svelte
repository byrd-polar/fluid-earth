<script>
  import LinearProgress from '@smui/linear-progress';
  import { onMount } from 'svelte';

  export let fetcher;

  let progress = 0;
  let closed = false;

  onMount(() => {
    setTimeout(() => {
      progress = 1;
      closed = true;
    }, 2000);
  });
</script>

<div>
  <LinearProgress class="prog" {progress} {closed} />
</div>

<style>
  div {
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  :global(.prog) {
    max-width: 75%;
    width: 24rem;
    height: 0.75em;
  }
</style>
