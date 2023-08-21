<script>
  import Button from '../components/Button.svelte';
  import IconButton from '../components/IconButton.svelte';
  import PinIcon from 'carbon-icons-svelte/lib/LocationFilled.svelte';
  import Close from 'carbon-icons-svelte/lib/Close.svelte';
  import { slide, fade } from 'svelte/transition';
  import { convert, prettyUnit } from '../units.js';
  import { prettyLatLon } from '../utility.js';

  export let pins;
  export let griddedData;
  export let griddedUnit;
  export let moveTo;

  $: values = pins.map(pin => griddedData.get([pin.longitude, pin.latitude]));
  $: originalUnit = griddedData.originalUnit;
</script>

<ul>
  {#each pins as pin, i (pin)}
    <li transition:slide>
      <div class="wrapper">
        <IconButton
          action={() => moveTo(pin)}
          name={'Fly to marker'}
          tipPlacement={'top'}
        >
          <PinIcon size={32} style="color: red" />
        </IconButton>
        <div class="text">
          <h3>{pin.label}</h3>
          <p>
            {#if isNaN(values[i])}
              No data
            {:else}
              {convert(values[i], originalUnit, griddedUnit).toFixed(1)}
              {prettyUnit(griddedUnit)}
            {/if}
          </p>
          <p>{prettyLatLon(pin.latitude, pin.longitude)}</p>
        </div>
        <IconButton
          action={() => pins = pins.filter(p => p !== pin)}
          ariaLabel="Remove pin"
        >
          <Close size={32} />
        </IconButton>
      </div>
    </li>
  {/each}
</ul>
{#if pins.length > 1}
  <div transition:slide>
  <Button secondary full transition action={() => pins = []}>
    Remove all pins
  </Button>
  </div>
{:else if pins.length === 0}
  <p transition:fade>There are currently no marked locations.</p>
{/if}

<style>
  ul {
    padding: 0;
    margin: 0;
  }

  li {
    list-style: none;
    padding-bottom: 0.5em;
  }

  div.wrapper {
    border: thin solid rgba(255, 255, 255, 0.3);
    border-radius: 0.5em;
    background-color: rgba(29, 29, 29, 0.75);
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
