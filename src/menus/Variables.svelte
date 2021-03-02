<script>
  import Windy24 from "carbon-icons-svelte/lib/Windy24";
  import TemperatureHot24 from "carbon-icons-svelte/lib/TemperatureHot24";
  import TemperatureWater24 from "carbon-icons-svelte/lib/TemperatureWater24";
  import QOperationGauge24 from "carbon-icons-svelte/lib/QOperationGauge24";
  import Rain24 from "carbon-icons-svelte/lib/Rain24";
  import Cloudy24 from "carbon-icons-svelte/lib/Cloudy24";
  import RainDrop24 from "carbon-icons-svelte/lib/RainDrop24";
  import Smoke24 from "carbon-icons-svelte/lib/Smoke24";
  import Draw24 from "carbon-icons-svelte/lib/Draw24";
  import PauseFilled24 from "carbon-icons-svelte/lib/PauseFilled24";
  import PlayFilledAlt24 from "carbon-icons-svelte/lib/PlayFilledAlt24";
  import colormaps from '../map/colormaps/';

  export let inventory;
  export let griddedDataset;
  export let particlesShown;

  let iconStyle = "fill: #0ff !important;";

  function selectMode(mode) {
    if(mode == 'on') {
      mode = 'weather';
    }
    if(mode == 'off') {
      mode = 'climate'
    }
  }

  let icons = [
    TemperatureHot24,
    TemperatureHot24,
    TemperatureHot24,
    QOperationGauge24,
    RainDrop24,
    Cloudy24,
    Windy24,
    TemperatureWater24,
  ];
</script>



<!-- Mode Toggle
<div class="onoffswitch" darkBackground = "true">
    <input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="myonoffswitch" tabindex="0" checked >
    <label class="onoffswitch-label" for="myonoffswitch">
        <span class="onoffswitch-inner" on:click={() => selectMode('on')}></span>
        <span class="onoffswitch-switch" on:click={() => selectMode('off')}>  </span>
    </label>
</div>
end of mode toggle -->

<h2>ATMOSPHERE</h2>

<ul>
  {#each inventory.filter(d => d.colormap) as dataset, i}
    <li
      class:selected={griddedDataset.name === dataset.name}
      on:click={() => griddedDataset = dataset}
    >
      <svelte:component this={icons[i]} style={iconStyle} />
      {dataset.name}
    </li>
  {/each}
</ul>

<h2>ANIMATION</h2>
<ul>
  <li on:click={() => particlesShown = !particlesShown}>
    {#if particlesShown}
      <PauseFilled24 />
    {:else}
      <PlayFilledAlt24 />
    {/if}
    {particlesShown ? 'Stop' : 'Resume'} animation
  </li>
</ul>


<style>
  ul {
    padding-left: 0.0rem;
  }

  li {
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    cursor: pointer;
    list-style-type: none;
  }

  .selected {
    color: gold;
  }

  /*
  .onoffswitch {
    position: relative;
    width: 150px;
    -webkit-user-select:none;
    -moz-user-select:none;
   -ms-user-select: none;
}
.onoffswitch-checkbox {
    position: absolute;
    opacity: 0;
    pointer-events: none;
}
.onoffswitch-label {
    display: block;
    overflow: hidden;
    cursor: pointer;
    border: 2px solid #999999;
    border-radius: 20px;
}
.onoffswitch-inner {
    display: block;
    width: 200%;
    margin-left: -100%;
    transition: margin 0.3s ease-in 0s;
}
.onoffswitch-inner:before, .onoffswitch-inner:after {
    display: block;
    float: left;
    width: 50%;
    height: 30px;
    padding: 0;
    line-height: 30px;
    font-size: 17px;
    color: white;
    box-sizing: border-box;
}
.onoffswitch-inner:before {
    content: "Weather Mode";
    padding-left: 10px;
    color: #FFFFFF;
    font-size: 1rem;
    font-weight: 400;
    color: hsla(0, 0%, 100%, .8);
}
.onoffswitch-inner:after {
    content: "Climate Mode";
    padding-right: 10px;
    color: #FFFFFF;
    text-align: right;
    font-size: 1rem;
    font-weight: 400;
    color: hsla(0, 0%, 100%, .8);
}
.onoffswitch-switch {
    display: block;
    width: 18px;
    margin: 6px;
    background: white;
    position: absolute;
    top: 0;
    bottom: 0;
    right: 122px;
    border: 2px
    solid #999999;
    border-radius: 20px;
    transition: all 0.3s ease-in 0s;
}
.onoffswitch-checkbox:checked + .onoffswitch-label .onoffswitch-inner {
    margin-left: 0;
}
.onoffswitch-checkbox:checked + .onoffswitch-label .onoffswitch-switch {
    right: 0px;
}
  */
</style>
