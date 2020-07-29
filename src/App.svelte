<script>
  import Map from './map/Map.svelte';

  let projection = 3;
  let longitude = 0;
  let latitude = 0;
  let zoom = 1;

  const speed = 1;

  function handleKeydown(event) {
    switch(event.key) {
      case 'ArrowUp':
      case 'w':
        latitude += speed;
        break;
      case 's':
      case 'ArrowDown':
        latitude -= speed;
        break;
      case 'd':
      case 'ArrowRight':
        longitude += speed;
        break;
      case 'a':
      case 'ArrowLeft':
        longitude -= speed;
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
    mouseDownLon = longitude;
    mouseDownLat = latitude;

    mouseDown = true;
  }

  function handleMouseMove(e) {
    if (mouseDown) {
      let xDiff = e.offsetX - mouseDownX;
      let yDiff = e.offsetY - mouseDownY;

      longitude = mouseDownLon - xDiff / (3 * zoom);
      latitude = mouseDownLat + yDiff / (3 * zoom);
    }
  }

  function handleWheel(e) {
    zoom += e.deltaY * -0.01;
  }
</script>

<main>
  <Map
    bind:projection
    bind:longitude
    bind:latitude
    bind:zoom
  />
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
  }
</style>
