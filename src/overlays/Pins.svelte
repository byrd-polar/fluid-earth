<script>
  import Pin from './Pin.svelte';

  export let d3geoProjection;

  let pins = new Set([
    {
      longitude: 0,
      latitude: 0,
    },
    {
      longitude: -50,
      latitude: 40,
    },
    {
      longitude: 720,
      latitude: -90,
    },
  ]);
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
