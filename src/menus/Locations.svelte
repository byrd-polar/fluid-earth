<script>
  import ky from 'ky';
  import SearchBox from '../components/SearchBox.svelte';
  import LocationsList from '../components/LocationsList.svelte';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  export let centerLongitude;
  export let centerLatitude;
  export let zoom;
  export let pins;
  export let griddedData;
  export let griddedUnit;

  let label = 'Search by country, city, or region:';
  let placeholder = 'Columbus, Ohio, United States';

  async function loadData() {
    return await ky('/data/locations.json', {timeout: false}).json();
  }

  async function onSelect(city) {
    await moveTo(city);
    dropPin(city);
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

  function dropPin(city) {
    if (!pins.find(pin => pin === city)) {
      pins = [city, ...pins];
    }
  }
</script>

<h2>About this menu</h2>
<p>
Locations on the map can be marked. Hover over the marker or see the section
below to view information about that location.
<p>
To mark a location, hold down the <b>left mouse button</b> on the map, or use
the following search box.
</p>

<SearchBox {label} {placeholder} {loadData} {onSelect} />

<h2>Marked locations</h2>
<LocationsList
  bind:pins
  {griddedData}
  {griddedUnit}
  {moveTo}
/>
