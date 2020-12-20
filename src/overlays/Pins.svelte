<script>
  import Pin from './Pin.svelte';

  export let d3geoProjection;
  export let pins;
</script>

<div>
  {#each [...pins] as pin (pin)}
    <Pin
      bind:pins
      {pin}
      {d3geoProjection}
    />
  {/each}
</div>

<style>
  div {
    pointer-events: none;
  }
</style>
