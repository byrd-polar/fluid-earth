import ky from 'ky';
import App from './App.svelte';
import colormaps from './map/colormaps/';

(async () => {
  let inventory = await ky('/data/inventory.json').json();

  // replace some strings in inventory with objects
  for (const path in inventory) {
    // replace ISO date strings (originally from JSON) with Date objects
    //
    // will need to update this if date strings are added in different sections
    // of the inventory
    if (inventory[path].start && inventory[path].end) {
      inventory[path].start = new Date(inventory[path].start);
      inventory[path].end = new Date(inventory[path].end);
    }
    // replace colormap strings with colormap objects
    if (inventory[path].colormap) {
      inventory[path].colormap = colormaps[inventory[path].colormap];
    }
  }

  new App({
    target: document.body,
    props: { inventory },
  });
})();
