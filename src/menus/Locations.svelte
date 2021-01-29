<script>
  import ky from 'ky';
  import SearchBox from '../components/SearchBox.svelte';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  export let centerLongitude;
  export let centerLatitude;
  export let zoom;
  export let addPin;

  let label = 'Search by country, city, or region:';

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
    console.log(city);
    let labelParts = city.label.split(",");
    let shortLabel = labelParts[0] + ", " + labelParts[2];
    addPin(shortLabel, city.longitude, city.latitude);
  }
</script>

<h2>PIN A LOCATION</h2>

<p>
  Locations on the map can be marked with a pin. Hover over the pin to see information about that location.<br>
  To mark a location with a pin:
</p>

<p>
  Hold down the <b>left mouse button</b> at that location, or...<br><br>
</p>

<SearchBox {label} {loadData} {onSelect} maxShown={10} />

<footer>
  Data from
  "<a href="https://simplemaps.com/data/world-cities">
  Basic World Cities Database v1.73</a>" by
  <a href="https://simplemaps.com">Pareto Software, LLC</a>, used under
  <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>
  / Text reformatted from original
</footer>

<style>
  footer {
    border-top: 1px solid white;
    margin-top: auto;
    font-size: 0.825em;
    padding: 0.5em;
  }

  a {
    color: #00BFA5;
  }
</style>
