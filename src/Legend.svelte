<script>
  export let griddedColormap;
  export let griddedDomain;

  let cssLut;
  $: cssLut = griddedColormap.lut.map(colorArray => {
    return `rgb(${colorArray.map(c => Math.round(255 * c)).join()})`;
  }).join();
</script>

<div class="legend-wrapper">
  <p>Hello there, I'm a color legend! (without units yet...)</p>
  <div
    class="legend"
    style="background: linear-gradient(to right, {cssLut});"
  ></div>
</div>

<style>
  div.legend-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
  }

  div.legend-wrapper > * {
    max-width: 90%;
    width: 30em;
  }

  p {
    color: white;
    margin-bottom: 0.25em;
  }

  div.legend {
    height: 2em;
    margin-bottom: 2em;
  }
</style>
