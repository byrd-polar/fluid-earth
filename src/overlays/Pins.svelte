<script>
  import Pin from './Pin.svelte';

  export let projection;
  export let centerLongitude;
  export let centerLatitude;
  export let zoom;

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

  let clientWidth;
  let clientHeight;
</script>

<div bind:clientWidth bind:clientHeight>
  {#each [...pins] as pin (pin)}
    <Pin
      bind:pins
      {pin}
      {projection}
      {centerLongitude}
      {centerLatitude}
      {clientWidth}
      {clientHeight}
      {zoom}
    />
  {/each}
</div>

<style>
  div {
    pointer-events: none;
  }
</style>
