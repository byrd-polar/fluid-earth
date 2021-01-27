<script>
  export let label = 'Search:';
  export let loadData = () => [];
  export let onSelect = () => {};
  export let maxShown = 10;

  let inputElement;
  let value = '';
  let options = [];
  let data = undefined;
  let focused = false;

  async function filterOptions() {
    if (!data) data = await loadData();

    let newOptions = [];
    for (let i = 0; i < data.length && newOptions.length < maxShown; i++) {
      if (data[i].label.toLowerCase().includes(value.toLowerCase())) {
        newOptions.push(data[i]);
      }
    }
    options = newOptions;
  }

  function select(option) {
    inputElement.blur();
    value = option.label;
    onSelect(option);
  }
</script>

<div
  on:focusin={() => focused = true}
  on:focusout={() => focused = false}
>
  <label>
    {label}
    <input
      bind:this={inputElement}
      type="text"
      spellcheck="false"
      bind:value
      on:focus={filterOptions}
      on:input={filterOptions}
    >
  </label>
  {#if focused}
    <ul>
      {#each options as option}
        <li
          class="option"
          on:mousedown|preventDefault
          on:click={() => { select(option) }}
        >
          {option.label}
        </li>
      {:else}
        {#if data}
          <li on:mousedown|preventDefault>
            No matches found
          </li>
        {:else}
          <li on:mousedown|preventDefault>
            Loading...
          </li>
        {/if}
      {/each}
    </ul>
  {/if}
</div>

<style>
  input, ul {
    color: white;
    background-color: #464646;
  }

  input {
    font-size: 16px;
    width: 100%;
    border: none;
    margin-top: 0.25em;
    padding: 0.5em;
  }

  ul {
    margin-top: 0.25em;
    padding: 0;
  }

  li {
    list-style: none;
    padding: 0.5em;
    cursor: default;
  }

  li.option {
    user-select: none;
    cursor: pointer;
  }

  li:not(.option) {
    opacity: 0.8;
  }

  li.option:hover {
    background-color: rgba(69, 161, 255, 0.2);
  }
</style>
