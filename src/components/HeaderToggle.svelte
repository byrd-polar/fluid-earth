<script>
  import Toggle from "svelte-toggle";

  export let menusDetailed;
</script>

<div>
  <Toggle
    bind:toggled={menusDetailed}
    label="Advanced options"
    toggledColor="#676778"
    style="margin-left: auto"
  />
</div>

<style>
  div {
    margin-left: auto;
  }

  div :global(label) {
    text-align: right;
  }
</style>
