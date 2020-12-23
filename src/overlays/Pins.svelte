<script>
  import Pin from './Pin.svelte';

  export let d3geoProjection;
  export let pins;
  export let griddedData;
  export let datasetInfo;
</script>

<div>
  {#each [...pins] as pin (pin)}
    <Pin
      bind:pins
      {pin}
      {d3geoProjection}
      {griddedData}
      {datasetInfo}
    />
  {/each}
</div>

<style>
  div {
    pointer-events: none;
    overflow: hidden;
  }
</style>
