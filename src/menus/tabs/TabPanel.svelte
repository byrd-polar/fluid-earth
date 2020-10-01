<script>
  import { registerPanel, selectedPanel } from './Tabs.svelte';

  const panel = {};

  registerPanel(panel);
</script>

{#if $selectedPanel === panel}
  <slot></slot>
{/if}
