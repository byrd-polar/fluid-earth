<script>
  import Pin from '../components/Pin.svelte';
  import HoverBubble from '../components/HoverBubble.svelte';

  export let forwardProjectionFunction;
  export let pins;
  export let cursor;
  export let griddedName;
  export let griddedData;
  export let griddedUnit;
  export let griddedDomain;
  export let griddedScale;
  export let griddedColormap;

  export let kioskMode;
</script>

<div>
  {#if !kioskMode}
    {#each pins as pin (pin)}
      <Pin
        bind:pins
        {pin}
        {forwardProjectionFunction}
        {griddedName}
        {griddedData}
        {griddedUnit}
      />
    {/each}
  {/if}
  {#if cursor}
    <HoverBubble
      {forwardProjectionFunction}
      lonLat={[cursor.longitude, cursor.latitude]}
      {griddedName}
      {griddedData}
      {griddedDomain}
      {griddedUnit}
      {griddedScale}
      {griddedColormap}
    />
  {/if}
</div>

<style>
  div {
    pointer-events: none;
    overflow: hidden;
    z-index: 0; /* create separate stacking context for pins */
  }
</style>
