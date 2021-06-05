<script>
  import Toggle from "svelte-toggle";

  export let simplifiedMode;
</script>

<div>
  <Toggle
    bind:toggled={simplifiedMode}
    label="Simplified mode"
    toggledColor="var(--primary-color-light)"
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

  div :global(button) {
    -webkit-tap-highlight-color: transparent;
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
    transition:
      transform 150ms ease-out,
      background-color 0.25s ease 0s;
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
