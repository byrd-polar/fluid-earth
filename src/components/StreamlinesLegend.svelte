<script>
  import { capitalizeFirstLetter } from '../utility.js';

  export let particleDataset;
  export let particleDisplay;

  // updates when changing display independently of dataset (or after dataset
  // download completes)
  $: info = particleDisplay;
  // updates immediately after selecting dataset instead of after download
  $: info = particleDataset.particleDisplay;
</script>

<section>
  <h3>{capitalizeFirstLetter(particleDataset.name)}</h3>
  <div></div>
  <span>{info.rate.toLocaleString()} times faster than actual</span>
</section>

<style>
  section {
    flex: 1;
    padding: 0.25rem 0.75rem;
    max-width: 32em;
    flex-basis: 24em;
    pointer-events: auto;

    margin-left: auto;
  }

  h3 {
    margin: 0;
    font-size: 1em;
  }

  @keyframes slide {
    from { background-position-x: 0; }
    to   { background-position-x: 0.8em; }
  }

  div {
    height: 0.8em;

    background-image:
      radial-gradient(#ffffff88 0%, #ffffff88 60%, transparent 60%);
    background-position: 0 -0.05em;
    background-size: 0.8em 0.8em;
    animation: slide 0.3s linear;
    animation-iteration-count: infinite;
  }

  span {
    font-size: 0.75rem;
    min-height: 1.25rem;

    display: block;
    text-align: center;
    border-top: 1px solid white;
  }
</style>
