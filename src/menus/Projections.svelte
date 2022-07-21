<script>
  import projections from '../map/projections/';
  import Button from '../components/Button.svelte';
  import ProjectionPicker from '../components/ProjectionPicker.svelte';

  export let projection;
  export let centerLongitude;
  export let centerLatitude;
  export let zoom;

  let selectedViews = [
    {
      name: 'globe',
      function: () => {
        projection = projections.VERTICAL_PERSPECTIVE;
        centerLongitude = -75;
        centerLatitude = 45;
        zoom = 1.5;
      },
      image: '/images/ortho-white-bg.svg',
    },
    {
      name: 'wall map',
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
        zoom = 5;
      },
      image: '/images/stereo-north-white-bg.svg',
    },
    {
      name: 'antarctic',
      function: () => {
        projection = projections.STEREOGRAPHIC;
        centerLongitude = 0;
        centerLatitude = -90;
        zoom = 5;
      },
      image: '/images/stereo-south-white-bg.svg',
    },
  ];
</script>


<details open>
<summary><h2>Selected Views</h2></summary>
<div>
  {#each selectedViews as view}
    <Button action={view.function} secondary>
      <span>{view.name}</span>
      <img src={view.image} height="128" width="128" alt="{view.name} preview">
    </Button>
  {/each}
</div>
</details>


<details>
<summary><h2>More Projections</h2></summary>
<ProjectionPicker bind:projection />
</details>

<style>
  div {
    --secondary-color: var(--secondary-color-transparent);
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
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
</style>
