<script>
  import { prng_alea } from 'esm-seedrandom/esm/'

  export let hidden;

  // For ensuring size and position of stars is properly relative to actual size
  // of rendered map; see the screenRatio variable in Map.svelte for details
  let elementHeight = 1080;
  $: screenRatio = elementHeight / 1080;

  let prng = prng_alea('Bag Raiders');

  let boxShadowString = Array.from({length: 1000}, () => {
    let offsetX = prng() * 5 * 1080 - 2.5 * 1080;
    let offsetY = prng() * 1080 - 0.5 * 1080;
    let size = Math.exp(-3 * prng());
    let alpha = prng();

    return `calc(${offsetX} * var(--base-unit)) ` +
           `calc(${offsetY} * var(--base-unit)) ` +
           '0 ' +
           `calc(${size} * var(--base-unit)) ` +
           `rgba(255, 255, 255, ${alpha})`;
  }).join(',');
</script>

<div
  class="field"
  style="--base-unit: {screenRatio}px"
  bind:clientHeight={elementHeight}
  class:hidden
>
  <div class="star" style="box-shadow: {boxShadowString}"></div>
</div>

<style>
  .field {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: black;
  }

  .star {
    position: absolute;
    border-radius: 50%;
    height: 1px;
    width: 1px;
  }

  .hidden > .star {
    display: none;
  }
</style>
