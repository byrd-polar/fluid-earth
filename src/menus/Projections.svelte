<script>
  import projections from '../map/projections/';

  let current = 'orthographic';
  export let projection;
  export let centerLongitude;
  export let centerLatitude;
  export let zoom;


  function selectMenuItem(currentItem) {
    current = currentItem;
    zoom = 1;

    if(current == 'equirectangular'){
      centerLongitude = 0;
      centerLatitude = 0;
      projection = projections.EQUIRECTANGULAR;
    }
    else if(current == 'polarStereoNorth'){
      centerLongitude = -60;
      centerLatitude = 90;
      projection = projections.EQUIRECTANGULAR;
    }
    else if(current == 'polarStereoSouth'){
      centerLongitude = 0;
      centerLatitude = -90;
      projection = projections.EQUIRECTANGULAR;
    }
    else if(current == 'orthographic'){
      centerLongitude = -60;
      centerLatitude = 30;
      projection = projections.ORTHOGRAPHIC;
    }
  }

</script>


<h2>MAP PROJECTIONS</h2>

<ul>
  <div class="d-flex flex-row">
    <li
      id="orthographic"
      class="{current === 'orthographic' ? 'selected' : ''}"
      on:click={() => selectMenuItem('orthographic')}
    >
      <div class="label">
        Globe<br>
        <img src="/images/ortho-white-bg.svg" alt="Orthographic projection">
      </div>
    </li>
    <li
      id="polarStereoNorth"
      class="{current === 'polarStereoNorth' ? 'selected' : ''}"
      on:click={() => selectMenuItem('polarStereoNorth')}
    >
      <div class="label">
        Arctic<br>
        <img src="/images/stereo-north-white-bg.svg" alt="North polar projection">
      </div>
    </li>
  </div>
  <div class="d-flex flex-row">
  <li
    id="polarStereoSouth"
    class="{current === 'polarStereoSouth' ? 'selected' : ''}"
    on:click={() => selectMenuItem('polarStereoSouth')}
    >
      <div class="label">
        Antarctic<br>
        <img src="/images/stereo-south-white-bg.svg" alt="South polar projection">
      </div>
    </li>
    <li
      id="equirectangular"
      class="{current === 'equirectangular' ? 'selected' : ''}"
      on:click={() => selectMenuItem('equirectangular')}
    >
      <div class="label">
        Map<br>
        <img src="/images/equirect-white-bg.svg" alt="Equirectangular projection">
      </div>
    </li>
  </div>
</ul>


<style>
  ul {
    padding-left: 0.0rem;
  }

  li {
    font-family: Quicksand-regular;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    cursor: pointer;
    list-style-type: none;
    padding: .75rem 1.25rem;
    border-radius: 0.5rem;
    display: inline-block;
  }

  li:hover {
    background-color: #323232;
  }

  div.label {
    padding-left: .5rem;
  }

  .selected {
    color: gold;
  }
</style>
