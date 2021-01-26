<script>
  
  export let arr;
  export let onValueSelected;
  
  let imin = 0;
  let imax = arr.length - 1;
  let arrLower = arr.map(x => x.toLowerCase());
  let oldInputLength = 0;
  let currentFocus;
  
  let inputField;
  let width;
  let val;
  let autocompleteList = [];
  let searching = false;

  
  function autocomplete() {
    endSearch()
    searching = true;
    let a, b, i;
    let valLower = val.toLowerCase();
    let inputLength = val.length;
    let width = inputField.offsetWidth;
    let ilist = [];
    let innerHtml = "";
    // Abort if entered value is too short.
    if (!val || inputLength < 2) {
      endSearch()
      return;
    }
    // If the entered value was shortened (backspace, del, etc.), reset.
    if (inputLength <= oldInputLength) {
      imin = 0;
      imax = arr.length - 1;
      ilist = [];
    }
    currentFocus = -1; 
    for (i = imin; i <= imax; i++) { // For each item in the array
      // If item starts w/ same letters as text field value,
      if (valLower === arrLower[i].substr(0, inputLength)) {
        // Note that this index has been processed.
        ilist.push(i);
        // Create new html fragment, bolding the matching letters.
        innerHtml = "<strong>" + arr[i].substr(0, val.length) + "</strong>"; 
        innerHtml += arr[i].substr(val.length);
        // Add as a new item to the autocomplete list.
        let newItem = { id: i+1, name: arr[i], innerHtml: innerHtml, active: false };
        autocompleteList = [...autocompleteList, newItem];
      } else if (valLower < arrLower[i].substr(0, inputLength)) {
        break;
      }
    }
    imin = ilist[0];
    imax = ilist[ilist.length - 1];
    oldInputLength = inputLength;
  }
  
  
  function changeCurrentFocus(direction) {
    if (direction === 'down') {
      currentFocus++;
    } else {
      currentFocus--;
    }
    if (currentFocus >= autocompleteList.length) {
      currentFocus = 0;
    }
    if (currentFocus < 0) {
      currentFocus = (autocompleteList.length - 1);
    }
    autocompleteList.map(function(x) { 
      x.active = false; 
      return x
    });
    autocompleteList[currentFocus].active = true;
  }
  
  function handleKey(event) {
    let keyCode = event.keyCode;
    if (keyCode == 40) { // DOWN key
      changeCurrentFocus('down');
    } else if (keyCode == 38) { // UP key
      changeCurrentFocus('up');
    } else if (keyCode == 13 && currentFocus > -1) { // ENTER key
      selectValue(autocompleteList[currentFocus].name);
    }
    
  }
  
  function selectValue(valueName) {
    val = valueName;
    endSearch();
    onValueSelected(val);
  }
  
  function endSearch() {
    autocompleteList = [];
    searching = false;
  }
  
</script>



<div on:click={endSearch}>
  
  <input
    type="text"
    class={searching ? "searching": ""}
    placeholder="Type country, city, or region"
    bind:this={inputField}
    bind:value={val}
    on:input={autocomplete}
    on:keydown={handleKey}
  />

  {#each autocompleteList as value (value.id)}
    <div
        class="autocomplete-items {value.active ? "active": ""}"
        style="width:{width}px;"
        on:click={selectValue(value.name)}
    >
      {@html value.innerHtml}
    </div>
  {/each}

</div>



<style>
  input {
      background-color: #fff;
      border: 1px solid #d4d4d4;
      color: #000;
      font-family: Quicksand-regular;
      font-size: .9rem;
      line-height: 1rem;
      padding: 10px;
      text-align: left;
      border-radius: .25rem .25rem .25rem .25rem
  }

  input.searching {
      border-radius: .25rem .25rem 0 0
  }

  .autocomplete-items {
      background-color: #fff;
      border: 1px solid #d4d4d4;
      border-top: none;
      color: #000;
      cursor: pointer;
      font-family: Quicksand-regular;
      font-size: .9rem;
      line-height: 1rem;
      padding: 10px;
      text-align: left;
  }
    
  .autocomplete-items:last-child {
    border-radius: 0 0 .25rem .25rem
  }

  .autocomplete-items:hover {
    background-color: #e9e9e9
  }

  .active {
    background-color: #9dceff !important;
  }  
</style>