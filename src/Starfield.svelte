<script>
  import prng_alea from 'esm-seedrandom/esm/alea.mjs'

  // For ensuring size and position of stars is properly relative to actual size
  // of rendered map; see the screenRatio variable in Map.svelte for details
  let elementHeight = 1080;
  $: screenRatio = elementHeight / 1080;

  let prng = prng_alea('Bag Raiders');

  let boxShadowString = Array.from({length: 1000}, () => {
    let offsetX = prng() * 5 * 1080 - 2.5 * 1080;
    let offsetY = prng() * 1080 - 0.5 * 1080;
    let blur = prng() * 2;
    let size = Math.exp(-3 * prng());

    return `calc(${offsetX} * var(--base-unit)) ` +
           `calc(${offsetY} * var(--base-unit)) ` +
           `calc(${blur} * var(--base-unit)) ` +
           `calc(${size} * var(--base-unit)) ` +
           'white';
  }).join(',');
</script>

<div
  class="field"
  style="--base-unit: {screenRatio}px"
  bind:clientHeight={elementHeight}
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
</style>
