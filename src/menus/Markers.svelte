<script>
  import ArrowRight20 from "carbon-icons-svelte/lib/ArrowRight20";
  import Close32 from "carbon-icons-svelte/lib/Close32";
</script>


<h2>MARKER OPTIONS</h2>

<ul class="list-group">
  <li>
    <input type="checkbox" name="list-marker-options" id="marker-mode" checked>
    <label for="marker-mode">
      Allow multiple markers
    </label>
  </li>
</ul>

<div id="marker-header" class="border">
  <h3>SAVED LOCATIONS</h3>
  <div class="button-group">
    <button id="shareMenuMarkers" type="button">
      <span>Share  Locations</span>
      <ArrowRight20 />
    </button>
    <button id="clearMenuMarkers" type="button">
      <Close32 />
    </button>
  </div>
  <ul id="markers-menu"></ul>
</div>


<style>
  ul {
    padding-left: 0.0rem;
  }

  li {
    font-family: Quicksand-regular;
    font-size: 1rem;
    font-weight: 400;
    margin-bottom: 0;
    cursor: pointer;
    list-style-type: none;
  }

  h3 {
    font-family: Quicksand-regular;
    font-size: 1rem;
    font-weight: 400;
  }

  .border {
    padding-top: 1rem;
    border: 1px solid #f8f9fa;
  }

  .button-group {
    display: flex;
  }

  button {
    cursor: pointer;
    padding: .375rem .75rem;
    border: 1px solid #f8f9fa;
    font-family: Quicksand-regular;
    font-size: 1rem;
    font-weight: 400;
  }

  #shareMenuMarkers {
    flex: 1 1 auto;
    background-color: #343a40;
    color: #fff;
    border-left: 0;
  }

  #shareMenuMarkers:hover {
    background-color: #272a2e;
  }

  #clearMenuMarkers {
    flex: 0 1 auto;
    width: 25%;
    background-color: #dc3545;
    color: #fff;
    border-right: 0;
  }

  #clearMenuMarkers:hover {
    background-color: #ba1c2b;
  }
</style>
