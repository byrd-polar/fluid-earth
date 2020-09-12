<script>
  export let opened;
</script>

<div class:selected={opened}>
  <slot></slot>
</div>

<style>
  div {
    width: 30em;
    margin-left: -30em;
    visibility: hidden;
    transition: margin-left 0.3s ease 0s, visibility 0s linear 0.3s;
  }

  div.selected {
    visibility: visible;
    margin-left: 0;
    transition: margin-left 0.3s ease 0s, visibility 0s linear 0s;
  }
</style>
