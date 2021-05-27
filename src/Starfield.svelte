<script>
  import prng_alea from 'esm-seedrandom/esm/alea.mjs'

  // For ensuring size and position of stars is properly relative to actual size
  // of rendered map; see the screenRatio variable in Map.svelte for details
  let elementHeight = 1080;
  $: screenRatio = elementHeight / 1080;

  let prng = prng_alea('Bag Raiders');

  function boxShadowString(count) {
    return Array.from({length: count}, () => {
      let offsetX = prng() * 3 * 1080 - 1.5 * 1080;
      let offsetY = prng() * 1080 - 0.5 * 1080;
      let blur = prng() * 2;

      return `calc(${offsetX} * var(--base-unit)) ` +
             `calc(${offsetY} * var(--base-unit)) ` +
             `calc(${blur} * var(--base-unit)) white`;
    }).join(',');
  }
</script>

<div
  class="field"
  style="--base-unit: {screenRatio}px"
  bind:clientHeight={elementHeight}
>
  <div class="bigg-star" style="box-shadow: {boxShadowString(10)}"></div>
  <div class="medi-star" style="box-shadow: {boxShadowString(100)}"></div>
  <div class="smol-star" style="box-shadow: {boxShadowString(1000)}"></div>
</div>

<style>
  .field {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: black;
  }

  .field > * {
    position: absolute;
    border-radius: 50%;
  }

  .smol-star {
    height: var(--base-unit);
    width: var(--base-unit);
  }

  .medi-star {
    height: calc(2 * var(--base-unit));
    width: calc(2 * var(--base-unit));
  }

  .bigg-star {
    height: calc(3 * var(--base-unit));
    width: calc(3 * var(--base-unit));
  }
</style>
