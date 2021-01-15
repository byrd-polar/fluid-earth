<script>
  import projections from '../map/projections/';
  import Button from '../components/Button.svelte';
  import Toggle from "svelte-toggle";
  import tooltip from '../tooltip.js';

  export let projection;
  export let centerLongitude;
  export let centerLatitude;
  export let zoom;
  export let particleDisplay;
  export let detailedMenus;

  $: if (projection === projections.STEREOGRAPHIC) {
    particleDisplay.size = 0.4;
  } else {
    particleDisplay.size = 0.8;
  }

  function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  let selectedViews = [
    {
      name: 'globe',
      function: () => {
        projection = projections.VERTICAL_PERSPECTIVE;
        centerLongitude = -60;
        centerLatitude = 30;
        zoom = 1;
      },
      image: '/images/ortho-white-bg.svg',
    },
    {
      name: 'map',
      function: () => {
        projection = projections.EQUIRECTANGULAR;
        centerLongitude = 0;
        centerLatitude = 0;
        zoom = 1;
      },
      image: '/images/equirect-white-bg.svg',
    },
    {
      name: 'arctic',
      function: () => {
        projection = projections.STEREOGRAPHIC;
        centerLongitude = -70;
        centerLatitude = 90;
        zoom = 2;
      },
      image: '/images/stereo-north-white-bg.svg',
    },
    {
      name: 'antarctic',
      function: () => {
        projection = projections.STEREOGRAPHIC;
        centerLongitude = 0;
        centerLatitude = -90;
        zoom = 2;
      },
      image: '/images/stereo-south-white-bg.svg',
    },
  ];
</script>

<Toggle
  bind:toggled={detailedMenus}
  label=""
  toggledColor="#676778"
  on="Detailed"
  off="Simple"
  style="margin-left: auto"
/>

<h2>Projections</h2>

<div class="grid" use:tooltip={{content: "\"Projections\" are different ways of fitting the three-dimensional globe to a flat screen. Each projection distorts the globe in a different way."}}>
  {#each selectedViews as view}
    <Button action={view.function} secondary>
      <span>{view.name}</span>
      <img src={view.image} height="128" width="128" alt="{view.name} preview">
    </Button>
  {/each}
</div>
<br>

{#if detailedMenus}
  <h2>More projections</h2>

  <div use:tooltip={{content: "Some more advanced projections to try out."}}>
    {#each Object.values(projections).filter(x => !([projections.VERTICAL_PERSPECTIVE, projections.EQUIRECTANGULAR].includes(x))) as p}
      <label>
        <input
          type="radio"
          bind:group={projection}
          value={p}
        >
        {capitalize(p.name)}
      </label>
    {/each}
  </div>
{/if}





<style>
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1em;
  }

  .grid :global(button) {
    display: flex;
    flex-direction: column;
  }

  img {
    filter: invert(0.88);
  }

  span {
    margin-bottom: 0.5em;
  }

  label {
    padding: 0.25em 0;
    display: block;
    cursor: pointer;
  }

  label:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
</style>
