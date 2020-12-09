<script>
  import AddComment32 from "carbon-icons-svelte/lib/AddComment32";
</script>

<div class = "title">
  <p>Fluid Earth Viewer<p>
</div>

<div class = "logos" >
  <a class = "nav-link tooltip" href="https://fever.byrd.osu.edu/feedback.html" target="_blank" alt="Leave feedback">
    <AddComment32 width = "35" height = "35"/>&nbsp;
    <span class="tooltiptext">Feedback</span>
  </a>
  <a class = "nav-link tooltip" href="https://www.nsf.gov/funding/pgm_summ.jsp?pims_id=504793" target="_blank">
    <img src = "NSF-logo-white-small.png" width = "35" height = "35"
         alt="National Science Foundation logo">&nbsp;
    <span class="tooltiptext">NSF AISL</span>
  </a>
  <a class = "nav-link tooltip" href="https://bpcrc.osu.edu/" target="_blank">
    <img src = "OSU-logo-white-small.png" width = "30" height = "35"
         alt="Ohio State University logo">
    <span class="tooltiptext">OSU BPCRC</span>
  </a>
</div>

<style>
  @media (max-width: 750px) {
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
  .tooltip {
	  position: relative;
	  display: inline-block;
	  border-bottom: 1px dotted black; /* If you want dots under the hoverable text */
	}

	/* Tooltip text */
	.tooltip .tooltiptext {
	  visibility: hidden;
	  background-color: black;
	  font-size: small;
	  color: #fff;
	  text-align: center;
	  padding: 5px 0;
	  border-radius: 6px;

	  /* Position the tooltip text - see examples below! */
	  position: absolute;
	  z-index: 1;
	  top: 105%;
	  right: 50%;
	}

	/* Show the tooltip text when you mouse over the tooltip container */
	.tooltip:hover .tooltiptext {
	  visibility: visible;
	}
</style>
