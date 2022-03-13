<script>
  import ky from 'ky';
  import SearchBox from '../components/SearchBox.svelte';
  import LocationsList from '../components/LocationsList.svelte';
  import Tweener from '../tweener.js';
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
    return await ky('/tera/locations.json.br', {timeout: false}).json();
  }

  async function onSelect(city) {
    await moveTo(city);
    dropPin(city);
  }

  let opts = {
    duration: 800,
    easing: cubicOut,
  }

  let lonTweener = new Tweener(c => centerLongitude = c, opts);
  let latTweener = new Tweener(c => centerLatitude = c, opts);
  let zoomTweener = new Tweener(z => zoom = z, opts);

  async function moveTo(city) {
    let zoomOutIn = zoom > 1.5;
    let originalZoom = zoom;

    if (zoomOutIn) await zoomTweener.tween(zoom, 1.5);

    // ensure the shorter way around is taken (across the anti-meridian)
    if (centerLongitude - city.longitude > 180) {
      centerLongitude -= 360;
    } else if (city.longitude - centerLongitude > 180) {
      centerLongitude += 360;
    }

    await Promise.all([
      lonTweener.tween(centerLongitude, city.longitude),
      latTweener.tween(centerLatitude, city.latitude),
    ]);

    if (zoomOutIn) await zoomTweener.tween(zoom, originalZoom);
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
