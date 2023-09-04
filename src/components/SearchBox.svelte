<script>
  export let label = 'Search:';
  export let placeholder = '';
  export let loadData = async () => [];
  export let onSelect = () => {};
  export let maxShown = 9;

  let value = '';
  let options = [];
  let data = undefined;
  let focused = false;
  let loading = false;
  let dropdownTemporarilyHidden = false;
  $: dropdownShown = focused
                  && (value.length > 0 || !loading)
                  && !dropdownTemporarilyHidden;

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

  $: candidateOption = dropdownShown && options.length > 0 ? options[0] : null;

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

<label>
  {label}
  <input
    type="search"
    spellcheck="false"
    bind:value
    on:focus={() => focused = true}
    on:blur={() => focused = false}
    on:focus={filterOptions}
    on:input={filterOptions}
    on:click={filterOptions}
    on:keydown={handleKeydown}
    class:dropdownShown
    {placeholder}
  >
</label>
<div class="anchor">
{#if dropdownShown}
<div class="spacer">
  <div
    role="presentation"
    class="dropdown"
    on:mousedown|preventDefault
  >
    {#if options.length > 0}
      <ul>
        {#each options as option}
          <li
            role="presentation"
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
</div>
{/if}
</div>

<style>
  input, div.dropdown {
    color: white;
  }

  input {
    font-size: 1rem;
    width: 100%;
    border: none;
    margin-top: 0.25em;
    padding: 0.75em 0.5em;
    outline: none;
    border-radius: 0.5em;
    border-bottom: thin solid transparent;
    background-color: var(--input-color);
  }

  input.dropdownShown {
    border-radius: 0.5em 0.5em 0 0;
    border-bottom: thin solid gray;
  }

  div.anchor {
    position: relative;
    margin-bottom: 1em;
  }

  div.spacer {
    z-index: 1;
    width: 100%;
    position: absolute;
    padding-bottom: 1em;
  }

  div.dropdown {
    padding-top: 0.25em;
    background-color: var(--input-color-opaque);
    box-shadow: 0 1px 1px black;
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
