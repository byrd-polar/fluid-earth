<script>
  import Map from './map/Map.svelte';
  import colormaps from './map/colormaps/';
  import projections from './map/projections/';

  let projection = projections.ORTHOGRAPHIC;
  let center = {
    longitude: 0,
    latitude: 0,
  };
  let zoom = 1;
  let griddedOptions = {
    data: {
      float32Array: new Float32Array([240]),
      width: 1,
      height: 1,
    },
    colormap: colormaps.MAGMA,
    domain: [220, 340],
  };

  let datasets = [
    {
      name: 'surface temperature',
      path: '/data/gfs-temperature.f32',
      domain: [220, 340],
    },
    {
      name: 'u-wind velocity',
      path: '/data/gfs-u-wind.f32',
      domain: [-30, 30],
    },
    {
      name: 'v-wind velocity',
      path: '/data/gfs-v-wind.f32',
      domain: [-30, 30],
    },
  ];
  let dataset = datasets[0];
  $: dataset, updateData();

  async function updateData() {
    let path = dataset.path;
    let buffer = await fetch(path).then(res => res.arrayBuffer());
    griddedOptions.data = {
      float32Array: new Float32Array(buffer),
      width: 1440,
      height: 721,
    }
    griddedOptions.domain = dataset.domain;
  }

  let vectorFieldOptions;
  async function updateParticleData() {
    let uPath = '/data/gfs-u-wind.f32';
    let vPath = '/data/gfs-v-wind.f32';
    let uBuffer = await fetch(uPath).then(res => res.arrayBuffer());
    let vBuffer = await fetch(vPath).then(res => res.arrayBuffer());
    vectorFieldOptions = {
      data: {
        uVelocities: new Float32Array(uBuffer),
        vVelocities: new Float32Array(vBuffer),
        width: 1440,
        height: 721,
      },
      particles: {
        rate: 5e4,
        count: 3e5,
        lifetime: 1000, // milliseconds
        enabled: true,
      }
    }
  }
  updateParticleData();


  const speed = 1;

  function handleKeydown(event) {
    switch(event.key) {
      case 'ArrowUp':
      case 'w':
        center.latitude += speed;
        break;
      case 's':
      case 'ArrowDown':
        center.latitude -= speed;
        break;
      case 'd':
      case 'ArrowRight':
        center.longitude += speed;
        break;
      case 'a':
      case 'ArrowLeft':
        center.longitude -= speed;
        break;
    }
  }

  let mouseDown = false;
  let mouseDownX;
  let mouseDownY;
  let mouseDownLon;
  let mouseDownLat;

  function handleMouseDown(e) {
    mouseDownX = e.offsetX;
    mouseDownY = e.offsetY;
    mouseDownLon = center.longitude;
    mouseDownLat = center.latitude;

    mouseDown = true;
  }

  function handleMouseMove(e) {
    if (mouseDown) {
      let xDiff = e.offsetX - mouseDownX;
      let yDiff = e.offsetY - mouseDownY;

      center.longitude = mouseDownLon - xDiff / (3 * zoom);
      center.latitude = mouseDownLat + yDiff / (3 * zoom);
    }
  }

  function handleWheel(e) {
    zoom += e.deltaY * -0.01;
  }
</script>

<nav></nav>
<main>
  <Map
    bind:projection
    bind:center
    bind:zoom
    bind:griddedOptions
    bind:vectorFieldOptions
  />
  <div>
    <label>Choose a map projection:
      <select bind:value={projection} name="projections">
        {#each Object.values(projections) as projection}
          <option value={projection}>{projection.name}</option>
        {/each}
      </select>
    </label>
    <label>Choose a dataset:
      <select bind:value={dataset} name="colormaps">
        {#each datasets as dataset}
          <option value={dataset}>{dataset.name}</option>
        {/each}
      </select>
    </label>
    <label>Choose a colormap:
      <select bind:value={griddedOptions.colormap} name="colormaps">
        {#each Object.values(colormaps) as colormap}
          <option value={colormap}>{colormap.name}</option>
        {/each}
      </select>
    </label>
  </div>
</main>
<aside></aside>

<svelte:window
  on:keydown={handleKeydown}
  on:mousedown={handleMouseDown}
  on:mousemove={handleMouseMove}
  on:mouseup={() => mouseDown = false}
  on:mouseout={() => mouseDown = false}
  on:wheel={handleWheel}
/>

<style>
  :global(body) {
    display: flex;
    flex-direction: row;
  }

  nav {
    /* width: 500px; */
  }

  main {
    position: relative;
    flex: 1;
  }

  :global(main > *) {
    width: 100%;
    height: 100%;
    position: absolute;
  }

  aside {
    /* width: 500px; */
    margin-left: auto;
  }

  label {
    padding-top: 1em;
    padding-left: 1em;
    display: block;
    color: white;
  }

  select {
    height: 2.5em;
  }
</style>
