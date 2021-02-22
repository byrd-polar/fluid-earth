<script>
  import { slide } from 'svelte/transition';
  import { dataPoint } from '../map/gridded.js';
  import { convert, prettyUnit, prettyLatLon } from '../utility.js';

  export let pins;
  export let griddedData;
  export let griddedUnit;

  $: values = pins.map(pin => {
    return dataPoint(griddedData, [pin.longitude, pin.latitude]);
  });
</script>

<ul>
  {#each pins as pin, i (pin)}
    <li transition:slide>
      <div>
        <h3>{pin.label}</h3>
        <p>
          {convert(values[i], griddedData, griddedUnit).toFixed(1)}
          {prettyUnit(griddedUnit)}
        </p>
        <p>{prettyLatLon(pin.latitude, pin.longitude)}</p>
      </div>
    </li>
  {/each}
</ul>

<style>
  ul {
    padding: 0;
    margin: 0.5em 0;
  }

  li {
    padding: 0.25em 0;
    list-style: none;
  }

  div {
    padding: 0.5em 1em;
    border: thin solid rgba(255, 255, 255, 0.3);
    border-radius: 0.5em;
    background: rgba(255, 255, 255, 0.03);
  }

  h3, p {
    margin: 0;
  }
</style>
