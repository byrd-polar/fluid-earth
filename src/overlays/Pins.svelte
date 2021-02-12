<script>
  import Pin from '../components/Pin.svelte';

  export let d3geoProjection;
  export let pins;
  export let griddedData;
  export let griddedDataset;
  export let griddedUnit;
</script>

<div>
  {#each [...pins] as pin (pin)}
    <Pin
      bind:pins
      {pin}
      {d3geoProjection}
      {griddedData}
      {griddedDataset}
      {griddedUnit}
    />
  {/each}
</div>

<style>
  div {
    pointer-events: none;
    overflow: hidden;
    z-index: 0; /* create separate stacking context for pins */
  }
</style>
