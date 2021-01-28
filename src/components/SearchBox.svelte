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
  let loading = false;

  async function filterOptions() {
    if (loading) return;

    if (!data) {
      loading = true;
      data = await loadData();
      loading = false;
    }

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

  $: selectedOption = options.length > 0 ? options[0] : null;

  function handleKeydown(e) {
    switch(e.key) {
      case "ArrowDown":
        arrow(+1);
        break;
      case "ArrowUp":
        arrow(-1);
        break;
      case "Escape":
        value = '';
        filterOptions();
        break;
      case "Enter":
        select(selectedOption);
        break;
      default:
        return;
    }
    e.preventDefault();
  }

  function arrow(step) {
    let index = options.indexOf(selectedOption);
    if (index === -1) return;

    index = (index + step + options.length) % options.length;
    selectedOption = options[index];
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
      on:keydown={handleKeydown}
    >
  </label>
  {#if focused}
    <ul style="width: {inputElement.clientWidth}px">
      {#each options as option}
        <li
          class="option"
          class:selected={selectedOption === option}
          on:mousedown|preventDefault
          on:click={() => { select(option) }}
        >
          {option.label}
        </li>
      {:else}
        {#if loading && value.length > 0}
          <li on:mousedown|preventDefault>
            Searching...
          </li>
        {:else if !loading}
          <li on:mousedown|preventDefault>
            No matches found
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
    position: absolute;
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

  li.selected.selected {
    background-color: rgba(69, 161, 255, 0.15);
  }
</style>
