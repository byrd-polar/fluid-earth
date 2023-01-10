<script>
  export let centerLatitude;
  export let centerLongitude;
  export let zoom;
  export let date;

  let channel = new BroadcastChannel('app_state');
  let foreignAppState = null;

  channel.onmessage = e => foreignAppState = e.data;

  $: localAppState = {
    centerLatitude,
    centerLongitude,
    zoom,
    date,
  };

  $: localAppState, foreignAppState, update();

  function update() {
    if (foreignAppState === null) {
      channel.postMessage(localAppState);
      return;
    }

    let fas = foreignAppState;
    foreignAppState = null;

    centerLatitude = fas.centerLatitude;
    centerLongitude = fas.centerLongitude;
    zoom = fas.zoom;
    date = fas.date;
  }
</script>

<!-- prevent non-primative variables from causing loops -->
<svelte:options immutable/>
