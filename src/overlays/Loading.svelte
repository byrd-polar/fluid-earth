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
    series[0].perc =
      closed ? 0 : Math.floor(100 * p.transferredBytes / p.totalBytes);
  });
</script>

<div class:closed>
  <ProgressBar rx="0" width="200" height="20" {series} />
</div>

<style>
  div {
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: center;
    /* Hack to get svg mask to display properly on Chromium */
    z-index: 0;
  }

  div.closed {
    visibility: hidden;
  }
</style>
