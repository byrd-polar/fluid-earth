<script>
  export let center;
  export let zoom;

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

<div
  on:mousedown={handleMouseDown}
  on:mousemove={handleMouseMove}
  on:mouseup={() => mouseDown = false}
  on:mouseout={() => mouseDown = false}
  on:wheel={handleWheel}
></div>

<svelte:window
  on:keydown={handleKeydown}
/>
