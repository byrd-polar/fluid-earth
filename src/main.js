import ky from 'ky';
import App from './App.svelte';
import colormaps from './map/colormaps/';
import dataProjections from './map/data-projections/';

(async () => {
  let inventory = await ky('/data/inventory.json', {
    timeout: false,
    headers: {
      'Cache-Control': 'no-cache',
    },
  }).json();

  // replace some strings in inventory with objects
  for (const dataset of inventory) {
    // replace ISO date strings (originally from JSON) with Date objects
    //
    // will need to update this if date strings are added in different sections
    // of the inventory
    for (const prop of ['start', 'lastForecast', 'end']) {
      if (prop in dataset) dataset[prop] = new Date(dataset[prop]);
    }
    // replace colormap strings with colormap objects
    if ('colormap' in dataset) {
      dataset.colormap = colormaps[dataset.colormap] || colormaps['VIRIDIS'];
    }
    // replace projection strings with projection objects
    if ('projection' in dataset) {
      dataset.projection =
        dataProjections[dataset.projection] || dataProjections['GFS'];
    }
  }

  new App({
    target: document.body,
    props: { inventory },
  });
})();
