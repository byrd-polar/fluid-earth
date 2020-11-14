<script>
  import ProgressBar from '@okrad/svelte-progressbar';

  export let fetcher;

  let series = [{
    perc: 0,
    color: '#015B5B', // theme color
  }];
  let closed = true;

  fetcher.addDownloadListener(p => {
    closed = (p.transferredBytes === p.totalBytes);
    series[0].perc = closed ? 0 : 100 * p.transferredBytes / p.totalBytes;
  });
</script>

<div class:closed>
  <ProgressBar rx="0" width="200" {series} />
</div>

<style>
  div {
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  div.closed {
    display: none;
  }
</style>
