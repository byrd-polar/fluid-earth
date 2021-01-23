<script>
  export let particleDataset;
  export let particleDisplay;
</script>

<section>
  <h3>{particleDataset.description}</h3>
  <div></div>
  <span>{particleDisplay.rate.toLocaleString()} times faster than actual</span>
</section>

<style>
  section {
    flex: 1;
    padding: 0 0.75rem 0.25rem;
    max-width: 32em;
    flex-basis: 24em;
    pointer-events: auto;

    margin-right: auto;
  }

  h3 {
    margin: 0;
    font-size: 1em;
  }

  h3::first-letter {
    text-transform: uppercase;
  }

  div {
    height: 0.8em;

    background-color: blue;
  }

  span {
    font-size: 0.75rem;
    min-height: 1.25rem;

    display: block;
    text-align: center;
    border-top: 1px solid white;
  }
</style>
