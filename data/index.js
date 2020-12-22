import { topology } from './topology.js';
import { inventory } from './inventory.js';
import { locations } from './locations.js';
import { mkdir, CACHE_DIR, OUTPUT_DIR } from './helpers.js';

function main() {
  mkdir(OUTPUT_DIR);
  mkdir(CACHE_DIR);

  Promise.all([
    topology(),
    inventory(),
    locations(),
  ]).then(() => console.log('Data processing complete.'));
}

main();
