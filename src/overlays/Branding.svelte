<script>
  import AddComment32 from "carbon-icons-svelte/lib/AddComment32";
  import tooltip from '../tooltip.js';
</script>

<div class = "title">
  <p>Fluid Earth Viewer<p>
</div>

<div class="logos">
  <a class="nav-link"
     href="https://fever.byrd.osu.edu/feedback.html"
     target="_blank"
     use:tooltip={{content: 'Feedback', placement: 'bottom'}}
  >
    <AddComment32 width = "35" height = "35"/>&nbsp;
  </a>
  <a class="nav-link"
     href="https://www.nsf.gov/funding/pgm_summ.jsp?pims_id=504793"
     target="_blank"
     use:tooltip={{content: 'NSF AISL', placement: 'bottom'}}
  >
    <img src = "NSF-logo-white-small.png" width = "35" height = "35"
         alt="National Science Foundation logo">&nbsp;
  </a>
  <a class="nav-link"
     href="https://bpcrc.osu.edu/"
     target="_blank"
     use:tooltip={{content: 'OSU BPCRC', placement: 'bottom'}}
  >
    <img src = "OSU-logo-white-small.png" width = "30" height = "35"
         alt="Ohio State University logo">
  </a>
</div>

<style>
  @media (max-width: 1000px) {
    .title {
      display: none;
    }
    .logos{
      display: none;
    }
  }

  .title {
   color: #D3D3D3;
    font-family: Quicksand-bold;
    font-size: 1.2rem;
    pointer-events: none;
    font-weight: bolder;
    margin-left: .75rem;
  }
  .logos{
    text-align: end;
    color: white;
    pointer-events: none;
    margin-right: 0rem;
    margin-top: .50rem;
  }
  .nav-link{
    pointer-events: auto;
    color: white;
    text-decoration: none;
  }
  .nav-link:link{
    color: white;
    text-decoration: none;
  }
  .nav-link:visited{
    color: white;
    text-decoration: none;
  }
</style>
