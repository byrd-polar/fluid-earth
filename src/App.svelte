<script>
  import Map from './map/Map.svelte';

  let longitude = 40;
  let latitude = 0;
  let zoom = 2;

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
</script>

<main>
  <Map
    bind:longitude
    bind:latitude
    bind:zoom
  />
</main>

<svelte:window on:keydown={handleKeydown}/>

<style>
  main {
    height: 100%;
    width: 100%;
  }
</style>
