<script>
  import Searchbar from '../components/Searchbar.svelte';
  import CITIES from '../../data/locations.json';

  export let addPin;

  let locationNames;
  let locationInfos = {};


  let name;
  let date;
  let lat;
  let lon;
  let country;
  let admin1;
  let cities = {};

  CITIES.cities.forEach(function (row) {
    [name, lat, lon, country, admin1] = row;
    if (name.startsWith("'")) return;
      let longName = name;
      if (admin1 !== "") {
        longName += ", " + admin1;
      }
      if (country !== "") {
        longName += ", " + country;
      }
      cities[longName] = {
      name: name,
        category: "city",
        lat: +row[1] * 0.01,
        lon: +row[2] * 0.01,
      };
    locationInfos[longName] = row;
  });

  locationNames = Object.keys(cities).sort((a, b) => {
    if (a.toLowerCase() < b.toLowerCase()) return -1;
    else if (a.toLowerCase() > b.toLowerCase()) return 1;
    return 0;
  });

  function pinLocation(locationName) {
    [ name, lat, lon, country, admin1 ] = locationInfos[locationName];
    let longitude = lon/100;
    let latitude = lat/100;
    let nameWithAdmin = name + (admin1 ? ", " : "") + (admin1 ? admin1 : "");
    addPin(nameWithAdmin, longitude, latitude);
  }
</script>



<Searchbar
  arr={locationNames}
  onValueSelected={pinLocation}
/>



<style>
  ul {
    padding-left: 0.0rem;
  }

</style>
