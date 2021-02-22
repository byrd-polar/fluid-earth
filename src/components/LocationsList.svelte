<script>
  import { fade } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import { dataPoint } from '../map/gridded.js';
  import { convert, prettyUnit, prettyLatLon } from '../utility.js';

  export let pins;
  export let griddedData;
  export let griddedUnit;

  let previousPinsLength = 0;
  let pinRemoved = false;
  $: {
    pinRemoved = pins.length < previousPinsLength;
    previousPinsLength = pins.length;
  }

  $: values = pins.map(pin => {
    return dataPoint(griddedData, [pin.longitude, pin.latitude]);
  });
</script>

<ul>
  {#each pins as pin, i (pin)}
    <li
      animate:flip={{ duration: 200, delay: pinRemoved ? 200 : 0}}
      in:fade={{duration: 200, delay: pins.length > 0 ? 200 : 0}}
      out:fade={{duration: 200}}
    >
      <h3>{pin.label}</h3>
      <p>
        {convert(values[i], griddedData, griddedUnit).toFixed(1)}
        {prettyUnit(griddedUnit)}
      </p>
      <p>{prettyLatLon(pin.latitude, pin.longitude)}</p>
    </li>
  {/each}
</ul>

<style>
  ul {
    padding: 0;
  }

  li {
    margin-top: 0.5em;
    padding: 0.5em 1em;
    list-style: none;
    border: thin solid rgba(255, 255, 255, 0.3);
    border-radius: 0.5em;
    background: rgba(255, 255, 255, 0.03);
  }

  h3, p {
    margin: 0;
  }
</style>
