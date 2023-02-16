import './app.css';
import App from './App.svelte';
import { GriddedDataset, ParticleDataset } from './datasets.js';
import { fetchPreloadedJson } from './utility.js';

(async () => {
  let inventory = await fetchPreloadedJson('/tera/inventory.json.br');

  let gDatasets = [...GriddedDataset.filter(inventory), GriddedDataset.none];
  let pDatasets = [...ParticleDataset.filter(inventory), ParticleDataset.none];

  new App({ target: document.body, props: { gDatasets, pDatasets } });
})();
