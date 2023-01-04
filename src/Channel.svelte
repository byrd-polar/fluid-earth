<script>
  export let centerLatitude;
  export let centerLongitude;
  export let zoom;

  let channel = new BroadcastChannel('app_state');
  let foreignAppState = null;

  channel.onmessage = e => foreignAppState = e.data;

  // non-object variables only to prevent loops
  $: localAppState = {
    centerLatitude,
    centerLongitude,
    zoom,
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
  }
</script>
