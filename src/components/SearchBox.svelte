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
  $: dropdownShown = focused && (value.length > 0 || !loading);

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

  $: candidateOption = options.length > 0 ? options[0] : null;

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
        if (candidateOption != null) select(candidateOption);
        break;
      default:
        return;
    }
    e.preventDefault();
  }

  function arrow(step) {
    let index = options.indexOf(candidateOption);
    if (index === -1) return;

    index = (index + step + options.length) % options.length;
    candidateOption = options[index];
  }
</script>

<div>
  <label>
    {label}
    <input
      bind:this={inputElement}
      type="text"
      spellcheck="false"
      bind:value
      on:focus={() => focused = true}
      on:blur={() => focused = false}
      on:focus={() => inputElement.select()}
      on:focus={filterOptions}
      on:input={filterOptions}
      on:keydown={handleKeydown}
    >
  </label>
  {#if dropdownShown}
    <div
      class="dropdown"
      style="width: {inputElement.clientWidth}px"
      on:mousedown|preventDefault
    >
      {#if options.length > 0}
        <ul>
          {#each options as option}
            <li
              class:considered={candidateOption === option}
              on:click={() => { select(option) }}
            >
              {option.label}
            </li>
          {/each}
        </ul>
      {:else if loading}
        <div class="info">
          Searching...
        </div>
      {:else}
        <div class="info">
          No matches found
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  input, div.dropdown {
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

  div.dropdown {
    margin-top: 0.25em;
    position: absolute;
  }

  ul {
    margin: 0;
    padding: 0;
  }

  li {
    list-style: none;
    padding: 0.5em;
    cursor: pointer;
    user-select: none;
  }

  div.info {
    cursor: default;
    padding: 0.5em;
    opacity: 0.8;
  }

  li:hover {
    background-color: rgba(69, 161, 255, 0.15);
  }

  li.considered {
    background-color: rgba(69, 161, 255, 0.2);
  }
</style>
