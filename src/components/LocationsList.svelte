<script>
  import IconButton from '../components/IconButton.svelte';
  import PinIcon from 'carbon-icons-svelte/lib/LocationHeartFilled32';
  import Close32 from "carbon-icons-svelte/lib/Close32";
  import { slide } from 'svelte/transition';
  import { convert, prettyUnit, prettyLatLon } from '../utility.js';

  export let pins;
  export let griddedData;
  export let griddedUnit;
  export let moveTo;

  $: values = pins.map(pin => griddedData.get([pin.longitude, pin.latitude]));
</script>

<ul>
  {#each pins as pin, i (pin)}
    <li transition:slide>
      <div class="wrapper">
        <IconButton
          action={() => moveTo(pin)}
          ariaLabel="Move to pin"
        >
          <PinIcon style="color: red" />
        </IconButton>
        <div class="text">
          <h3>{pin.label}</h3>
          <p>
            {convert(values[i], griddedData, griddedUnit).toFixed(1)}
            {@html prettyUnit(griddedUnit)}
          </p>
          <p>{prettyLatLon(pin.latitude, pin.longitude)}</p>
        </div>
        <IconButton
          action={() => pins = pins.filter(p => p !== pin)}
          ariaLabel="remove pin"
        >
          <Close32 />
        </IconButton>
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

  div.wrapper {
    border: thin solid rgba(255, 255, 255, 0.3);
    border-radius: 0.5em;
    background: rgba(255, 255, 255, 0.03);
    display: flex;
    align-items: center;
    padding: 0.5em;
  }

  div.text {
    flex: 1;
    padding: 0 0.5em;
  }

  h3, p {
    margin: 0;
  }
</style>
