<script>
  export let label = 'Search:';
  export let loadData = () => [];
  export let onSelect = () => {};
  export let maxShown = 9;

  let inputElement;
  let value = '';
  let options = [];
  let data = undefined;
  let focused = false;
  let loading = false;
  let dropdownTemporarilyHidden = false;
  $: dropdownShown = focused && (value.length > 0 || !loading) &&
    !dropdownTemporarilyHidden;

  async function filterOptions() {
    dropdownTemporarilyHidden = false;

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
    value = '';
    dropdownTemporarilyHidden = true;
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

<div class="wrapper">
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
      on:click={filterOptions}
      on:keydown={handleKeydown}
      class:dropdownShown
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
  div.wrapper {
    position: relative;
    margin-bottom: 0.5em;
  }

  input, div.dropdown {
    color: white;
    background-color: #464646;
  }

  input {
    font-size: 16px;
    width: 100%;
    border: none;
    margin-top: 0.25em;
    padding: 0.75em 0.5em;
    outline: none;
    border-radius: 0.5em;
    border-bottom: thin solid transparent;
  }

  input.dropdownShown {
    border-radius: 0.5em 0.5em 0 0;
    border-bottom: thin solid gray;
  }

  div.dropdown {
    position: absolute;
    z-index: 1;
    padding: 0.25em 0;
  }

  div.dropdown,
  div.dropdown div.info,
  div.dropdown ul :last-child {
    border-radius: 0 0 0.5em 0.5em;
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
