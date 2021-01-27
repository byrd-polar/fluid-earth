<script>
  import ky from 'ky';
  import SearchBox from '../components/SearchBox.svelte';

  export let centerLongitude;
  export let centerLatitude;
  export let zoom;

  let label = 'Search for country, city, or region:';

  async function loadData() {
    return await ky('/data/locations.json', {timeout: false}).json();
  }

  function onSelect(city) {
  }
</script>

<SearchBox {label} {loadData} {onSelect} maxShown={10} />
