<script>
  import { registerTab, selectTab, selectedTab } from './Tabs.svelte';

  export let TabIcon = null;

  const tab = {};

  registerTab(tab);
</script>

<style>
  button {
    background: none;
    border: none;
    border-bottom: 2px solid white;
    border-radius: 0;
    margin: 0;
    color: #ccc;
    font-family: Quicksand-regular !important;
    font-size: 1rem !important;
    font-weight: 400 !important;
    line-height: 1.5 !important;
    //color: hsla(0, 0%, 100%, .8) !important;
    cursor: pointer !important;
  }

  .selected {
    border-bottom: 2px solid teal;
  }
</style>

<button class:selected="{$selectedTab === tab}" on:click="{() => selectTab(tab)}">
  <TabIcon /><br>
  <slot></slot>
</button>
