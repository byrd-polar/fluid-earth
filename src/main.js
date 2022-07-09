import './app.css';
import App from './App.svelte';
import { GriddedDataset, ParticleDataset } from './datasets.js';
import { fetchJson } from './utility.js';

(async () => {
  let inventory = await fetchJson('/tera/inventory.json.br', {
    headers: { 'Cache-Control': 'no-cache' },
  });

  let gDatasets = [...GriddedDataset.filter(inventory), GriddedDataset.none];
  let pDatasets = [...ParticleDataset.filter(inventory), ParticleDataset.none];

  new App({ target: document.body, props: { gDatasets, pDatasets } });
})();
