<script>
  let current = 'orthographic';
  export let projection;
  export let center;
  export let zoom;

  function selectMenuItem(currentItem) {
    current = currentItem;
    zoom = 1;

    if(current == 'equirectangular'){
      center.longitude = 0;
      center.latitude = 0;
      projection = {name: 'equirectangular',
      id: 0};
    }
    else if(current == 'polarStereoNorth'){
      center.longitude = -60;
      center.latitude = 90;
      projection = {name: 'equirectangular',
      id: 0};
    }
    else if(current == 'polarStereoSouth'){
      center.longitude = 0;
      center.latitude = -90;
      projection = {name: 'equirectangular',
      id: 0};
    }
    else if(current == 'orthographic'){
      center.longitude = -60;
      center.latitude = 30;
       projection = {name: 'orthographic',
      id: 3};
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
