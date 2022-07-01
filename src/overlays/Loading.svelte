<script>
  import { addDatasetFetchListener } from '../datasets.js';

  let progress = 0;
  let total = 0;

  addDatasetFetchListener(status => ({ progress, total } = status));

  $: closed = (total === 0);
  $: percent = closed ? 100 : 100 * progress / total;
  $: style = 'background: linear-gradient(to right,'
    + `var(--primary-color) ${percent - 3}%, #1d1d1d ${percent + 3}%);`
</script>

<div>
  <span class:closed {style}>
    {Math.floor(percent)} %
  </span>
</div>

<style>
  div {
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  span {
    text-align: center;
    color: white;
    width: 220px;
    border-radius: 4px;
    box-shadow: 0 0 2px black;
    transition: opacity 0.3s;
  }

  span.closed {
    transition: none;
    opacity: 0;
  }
</style>
