<script>
  import projections from '../map/projections/';
  import Button from '../components/Button.svelte';

  export let projection;
  export let centerLongitude;
  export let centerLatitude;
  export let zoom;
  export let particleDisplay;

  $: if (projection === projections.STEREOGRAPHIC) {
    particleDisplay.size = 0.4;
  } else {
    particleDisplay.size = 0.8;
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


<h2>Selected Views</h2>

<div>
  {#each selectedViews as view}
    <Button action={view.function} secondary>
      <span>{view.name}</span>
      <img src={view.image} height="128" width="128" alt="{view.name} preview">
    </Button>
  {/each}
</div>

<h2>About this menu</h2>

<p>
  Map projections are the various ways of taking a three-dimensional globe and
  projecting it to the two-dimensional surface of a map.
</p>
<p>
  This will always distort the globe in some way, so each projection has its
  tradeoffs and use cases.
</p>

<h2>All Projections</h2>

{#each Object.values(projections) as p}
<label>
  <input
    type="radio"
    bind:group={projection}
    value={p}
  >
  {p.name}
</label>
{/each}


<style>
  div {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1em;
  }

  div :global(button) {
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
  }

  label:hover {
    background-color: rgba(1, 1, 1, 0.04);
  }
</style>
