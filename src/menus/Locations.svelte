<script>
  import ky from 'ky';
  import SearchBox from '../components/SearchBox.svelte';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  export let centerLongitude;
  export let centerLatitude;
  export let zoom;

  let label = 'Search for country, city, or region:';

  async function loadData() {
    return await ky('/data/locations.json', {timeout: false}).json();
  }

  async function onSelect(city) {
    await moveTo(city);
  }

  let opts = {
    duration: 800,
    easing: cubicOut,
  }

  let lonTweened = tweened(centerLongitude, opts);
  let latTweened = tweened(centerLatitude, opts);
  let zoomTweened = tweened(zoom, opts);

  $: centerLongitude = $lonTweened;
  $: centerLatitude = $latTweened;
  $: zoom = $zoomTweened;

  async function moveTo(city) {
    lonTweened = tweened(centerLongitude, opts);
    latTweened = tweened(centerLatitude, opts);
    zoomTweened = tweened(zoom, opts);

    let zoomOutIn = zoom > 1.5;
    let originalZoom = zoom;

    if (zoomOutIn) await zoomTweened.set(1.5);

    // ensure the shorter way around is taken (across the anti-meridian)
    if (centerLongitude - city.longitude > 180) {
      lonTweened = tweened(centerLongitude - 360, opts);
    } else if (city.longitude - centerLongitude > 180) {
      lonTweened = tweened(centerLongitude + 360, opts);
    }

    await Promise.all([
      lonTweened.set(city.longitude),
      latTweened.set(city.latitude),
    ]);

    if (zoomOutIn) await zoomTweened.set(originalZoom);
  }
</script>

<SearchBox {label} {loadData} {onSelect} maxShown={10} />
