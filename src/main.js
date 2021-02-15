import ky from 'ky';
import App from './App.svelte';
import colormaps from './map/colormaps/';

(async () => {
  let inventory = await ky('/data/inventory.json', {timeout: false}).json();

  // replace some strings in inventory with objects
  for (const dataset of inventory) {
    // replace ISO date strings (originally from JSON) with Date objects
    //
    // will need to update this if date strings are added in different sections
    // of the inventory
    if (dataset.start && dataset.lastForecast && dataset.end) {
      dataset.start = new Date(dataset.start);
      dataset.lastForecast = new Date(dataset.lastForecast);
      dataset.end = new Date(dataset.end);
    }
    // replace colormap strings with colormap objects
    if (dataset.colormap) {
      dataset.colormap = colormaps[dataset.colormap];
    }
  }

  new App({
    target: document.body,
    props: { inventory },
  });
})();
