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
  let griddedTextureInfo = {
    data: '/data/gfs-temperature.f32',
    colormap: colormaps.MAGMA,
    domain: [220, 340],
    width: 1440,
    height: 721,
  };

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

<main>
  <Map
    bind:projection
    bind:center
    bind:zoom
    bind:griddedTextureInfo
  />
  <label for="projection-select">Choose a map projection:</label>

  <select bind:value={projection} name="projections" id="projection-select">
    <option value="0">Equirectangular</option>
    <option value="1">Mercator</option>
    <option value="2">Equal Earth</option>
    <option value="3" selected>Orthographic</option>
  </select>
</main>

<svelte:window
  on:keydown={handleKeydown}
  on:mousedown={handleMouseDown}
  on:mousemove={handleMouseMove}
  on:mouseup={() => mouseDown = false}
  on:mouseout={() => mouseDown = false}
  on:wheel={handleWheel}
/>

<style>
  main {
    height: 100%;
    width: 100%;
    color: white;
  }

  label {
    margin: 1em 0.5em 0 1em;
  }

  select {
    margin-top: 1em;
  }
</style>
