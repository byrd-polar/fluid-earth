<script>
  import ArrowRight20 from "carbon-icons-svelte/lib/ArrowRight20";
  import Close32 from "carbon-icons-svelte/lib/Close32";
</script>


<h1>GEOGRAPHIC FEATURES</h1>

<ul class="list-group">
  <li>
    <input type="checkbox" name="list-marker-options" id="marker-mode" checked>
    <label for="marker-mode">
      National boundaries
    </label>
  </li>
  <li>
    <input type="checkbox" name="list-marker-options" id="marker-mode" checked>
    <label for="marker-mode">
      State/Province boundaries
    </label>
  </li>
  <li>
    <input type="checkbox" name="list-marker-options" id="marker-mode" checked>
    <label for="marker-mode">
      Mountain ranges
    </label>
  </li>
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
    margin-bottom: 0;
    cursor: pointer;
    list-style-type: none;
    padding: .5rem;
  }

  h1 {
    font-family: Quicksand-regular;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    border-bottom: 1px solid;
  }
</style>
