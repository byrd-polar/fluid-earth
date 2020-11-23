<script>
  import Windy24 from "carbon-icons-svelte/lib/Windy24";
  import TemperatureHot24 from "carbon-icons-svelte/lib/TemperatureHot24";
  import QOperationGauge24 from "carbon-icons-svelte/lib/QOperationGauge24";
  import Rain24 from "carbon-icons-svelte/lib/Rain24";
  import Cloudy24 from "carbon-icons-svelte/lib/Cloudy24";
  import RainDrop24 from "carbon-icons-svelte/lib/RainDrop24";
  import Smoke24 from "carbon-icons-svelte/lib/Smoke24";
  import Draw24 from "carbon-icons-svelte/lib/Draw24";
  import PauseFilled24 from "carbon-icons-svelte/lib/PauseFilled24";
  import PlayFilledAlt24 from "carbon-icons-svelte/lib/PlayFilledAlt24";

  let current = 'windSpeedAtSurface';
  let animationPaused = false;
  let iconStyle = "fill: #0ff !important;";

  function selectMenuItem(currentItem) {
    if (currentItem === 'windSpeed') {
      currentItem = 'windSpeedAtSurface';
    } else if (currentItem === 'temp') {
      currentItem = 'tempAtSurface';
    } else if (currentItem === 'airQuality') {
      currentItem = 'airQualityOzone';
    }

    current = currentItem;
  }
</script>


<h2>ATMOSPHERE</h2>
<ul>
  <li
    class="{current.includes('windSpeed') ? 'selected' : ''}"
    on:click={() => selectMenuItem('windSpeed')}
  >
    <Windy24 style={iconStyle}/>
    Wind Speed
  </li>
  {#if current.includes('windSpeed')}
    <ul>
      <li
        class="{current === 'windSpeedAtSurface' ? 'selected' : ''}"
        on:click={() => selectMenuItem('windSpeedAtSurface')}
      >at surface</li>
      <li
        class="{current === 'windSpeedAtCloud' ? 'selected' : ''}"
        on:click={() => selectMenuItem('windSpeedAtCloud')}
      >at cloud</li>
      <li
        class="{current === 'windSpeedAtCruise' ? 'selected' : ''}"
        on:click={() => selectMenuItem('windSpeedAtCruise')}
      >at cruise</li>
    </ul>
  {/if}
  <li
    class="{current.includes('temp') ? 'selected' : ''}"
    on:click={() => selectMenuItem('temp')}
  >
    <TemperatureHot24 style={iconStyle}/>
    Temperature
  </li>
  {#if current.includes('temp')}
    <ul>
      <li
        class="{current === 'tempAtSurface' ? 'selected' : ''}"
        on:click={() => selectMenuItem('tempAtSurface')}
      >at surface</li>
      <li
        class="{current === 'tempAtCloud' ? 'selected' : ''}"
        on:click={() => selectMenuItem('tempAtCloud')}
      >at cloud</li>
      <li
        class="{current === 'tempAtCruise' ? 'selected' : ''}"
        on:click={() => selectMenuItem('tempAtCruise')}
      >at cruise</li>
    </ul>
  {/if}
  <li
    class="{current === 'MSLP' ? 'selected' : ''}"
    on:click={() => selectMenuItem('MSLP')}
  >
    <QOperationGauge24 style={iconStyle}/>
    Mean Sea Level Pressure
  </li>
  <li
    class="{current === 'precip' ? 'selected' : ''}"
    on:click={() => selectMenuItem('precip')}
  >
    <Rain24 style={iconStyle}/>
    Precipitation
  </li>
  <li
    class="{current === 'totalCloudWater' ? 'selected' : ''}"
    on:click={() => selectMenuItem('totalCloudWater')}
  >
    <Cloudy24 style={iconStyle}/>
    Total Cloud Water
  </li>
  <li
    class="{current === 'totalPrecipWater' ? 'selected' : ''}"
    on:click={() => selectMenuItem('totalPrecipWater')}
  >
    <RainDrop24 style={iconStyle}/>
    Total Precipitable Water
  </li>
  <li
    class="{current.includes('airQuality') ? 'selected' : ''}"
    on:click={() => selectMenuItem('airQuality')}
  >
    <Smoke24 style={iconStyle}/>
    Air Quality
  </li>
  {#if current.includes('airQuality')}
    <ul>
      <li
        class="{current === 'airQualityOzone' ? 'selected' : ''}"
        on:click={() => selectMenuItem('airQualityOzone')}
      >Ozone</li>
      <li
        class="{current === 'airQualitySO2' ? 'selected' : ''}"
        on:click={() => selectMenuItem('airQualitySO2')}
      >Sulfur Dioxide</li>
      <li
        class="{current === 'airQualityCO' ? 'selected' : ''}"
        on:click={() => selectMenuItem('airQualityCO')}
      >Carbon Monoxide</li>
      <li
        class="{current === 'airQualityDust' ? 'selected' : ''}"
        on:click={() => selectMenuItem('airQualityDust')}
      >Dust</li>
    </ul>
  {/if}
</ul>

<h2>OCEAN</h2>
<ul>
  <li
    class="{current === 'currents' ? 'selected' : ''}"
    on:click={() => selectMenuItem('currents')}
  >
    <Draw24 style={iconStyle}/>
    Surface Currents
  </li>
  <li
    class="{current === 'seaTemp' ? 'selected' : ''}"
    on:click={() => selectMenuItem('seaTemp')}
  >
    <TemperatureHot24 style={iconStyle}/>
    Sea Surface Temperature
  </li>
</ul>

<h2>ANIMATION</h2>
<ul>
  <li on:click={() => animationPaused = !animationPaused}>
    {#if animationPaused}
      <PlayFilledAlt24 />
    {:else}
      <PauseFilled24 />
    {/if}
    {animationPaused ? 'Resume' : 'Stop'} animation
  </li>
</ul>


<style>
  ul {
    padding-left: 0.0rem;
  }

  ul ul {
    padding-left: 3.0rem;
  }

  li {
    font-family: Quicksand-regular;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    color: hsla(0, 0%, 100%, .8);
    cursor: pointer;
    list-style-type: none;
  }

  h2 {
    font-family: Quicksand-regular;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    color: hsla(0, 0%, 100%, .8);
    border-bottom: 1px solid;
  }

  .selected {
    color: gold;
  }
</style>
