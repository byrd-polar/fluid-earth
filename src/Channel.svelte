<script>
  import { tick } from 'svelte';

  export let centerLatitude;
  export let centerLongitude;
  export let zoom;
  export let cursor;

  let channel = new BroadcastChannel('app_state');
  let reactivityEnabled = true;

  $: broadcast({
    centerLatitude,
    centerLongitude,
    zoom,
    cursor,
  });

  function broadcast(appState) {
    if (reactivityEnabled) channel.postMessage(appState);
  }

  channel.onmessage = async e => {
    reactivityEnabled = false;

    centerLatitude = e.data.centerLatitude;
    centerLongitude = e.data.centerLongitude;
    zoom = e.data.zoom;
    cursor = e.data.cursor;

    await tick();

    reactivityEnabled = true;
  };
</script>
