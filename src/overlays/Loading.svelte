<script>
  import ProgressBar from '@okrad/svelte-progressbar';
  import { addDatasetFetchListener } from '../datasets.js';

  let series = [{
    perc: 0,
    color: getComputedStyle(document.body)
      .getPropertyValue('--primary-color')
      .substring(1),
  }];
  let closed = true;

  addDatasetFetchListener(({ progress, total }) => {
    closed = (total === 0);
    series[0].perc = closed ? 0 : Math.floor(100 * progress / total);
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
