<script>
  import projections from '../map/projections/';

  export let projection;
  export let particleDisplay;

  $: if (projection === projections.STEREOGRAPHIC) {
    particleDisplay.size = 0.4;
  } else {
    particleDisplay.size = 0.8;
  }
</script>


<h2>Selector</h2>

<p>Choose a map projection:</p>
{#each Object.values(projections) as p}
<label>
  <input
    type="radio"
    bind:group={projection}
    value={p}
  >
  {p.name}
</label>
{/each}

<h2>About this menu</h2>

<p>Map projections are the various ways of taking a three-dimensional globe and
projecting it to the two-dimensional surface of a map.</p>
<p>This will always distort the globe in some way, so each projection has its
tradeoffs.</p>


<style>
  label {
    padding: 0.25em 0;
    display: block;
  }

  label:hover {
    background-color: rgba(1, 1, 1, 0.04);
  }
</style>
