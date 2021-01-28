<script>
  import Toggle from "svelte-toggle";

  export let menusDetailed;
</script>

<div>
  <Toggle
    bind:toggled={menusDetailed}
    label="Advanced options"
    toggledColor="#40B598"
    untoggledColor="#ABABAB"
    style="margin-left: auto"
  />
</div>

<style>
  div {
    margin-left: auto;
  }

  div :global(label) {
    text-align: right;
    color: white;
  }

  div :global(button::after) {
    position: absolute;
    content: "";
    top: 0;
    bottom: 0;
    left: -0.75rem;
    margin: auto;
    height: 2.5rem;
    width: 2.5rem;
    text-align: center;
    border-radius: 50%;
    background-color: transparent;
    transition: transform 150ms ease-out;
  }

  div :global(button[aria-checked="true"]::after) {
    transform: translateX(1.375rem);
  }

  div :global(button:focus) {
    outline: none;
  }

  div :global(button:hover::after) {
    background-color: rgba(255, 255, 255, 0.05);
  }

  div :global(button:focus::after) {
    background-color: rgba(255, 255, 255, 0.15);
  }
</style>
