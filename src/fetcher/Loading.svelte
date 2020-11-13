<script>
  import LinearProgress from '@smui/linear-progress';

  export let fetcher;

  let progress = 0;
  let closed = true;

  fetcher.addDownloadListener(p => {
    closed = (p.transferredBytes === p.totalBytes);
    if (!closed) {
      progress = p.transferredBytes / p.totalBytes;
    }
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
