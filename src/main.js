import ky from 'ky';
import App from './App.svelte';
import { GriddedDataset, ParticleDataset } from './dataset.js';

(async () => {
  let inventory = await ky('/tera/inventory.json.br', {
    timeout: false,
    headers: {
      'Cache-Control': 'no-cache',
    },
  }).json();

  let gDatasets = inventory
    .filter(d => d.colormap)
    .map(d => new GriddedDataset(d));

  let pDatasets = inventory
    .filter(d => d.particleDisplay)
    .map(d => new ParticleDataset(d));

  new App({
    target: document.body,
    props: { gDatasets, pDatasets },
  });
})();
