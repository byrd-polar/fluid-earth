<script>
  export let opened = false;
</script>

<div class:selected={opened}>
  <slot></slot>
</div>

<style>
  div {
    width: 28em;
    margin-left: -28em;
    visibility: hidden;
    transition: margin-left 0.3s ease 0s, visibility 0s linear 0.3s;
    background-color: white;
    padding: 1em;
    overflow: auto;
  }

  div.selected {
    visibility: visible;
    margin-left: 0;
    transition: margin-left 0.3s ease 0s, visibility 0s linear 0s;
  }

  @media (max-width: 36rem) {
    div {
      width: 100%;
      /*
        Hack using auto instead of 0 to avoid animating from this property,
        such as when resizing to > 36rem (avoids menu from appearing, then
        closing immediately, messing up the canvas resize by making it low-res)

        Seems to be supported by spec, see note about auto value here:
        https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Transitions/Using_CSS_transitions
       */
      margin-left: auto;

      height: calc(100% - 3.5em);
      margin-top: 100vh;
      transition: margin-top 0.3s ease 0s, visibility 0s linear 0.3s;

      position: absolute;
      z-index: 1;
    }

    div.selected {
      margin-top: 3.5em;
      transition: margin-top 0.3s ease 0s, visibility 0s linear 0s;
    }
  }
</style>
