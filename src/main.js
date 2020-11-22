import ky from 'ky';
import App from './App.svelte';

(async () => {
  new App({
    target: document.body,
    props: {
      inventory: await ky('/data/inventory.json').json(),
    },
  });
})();
