import { topology } from './topology.js';
import { gfs } from './gfs.js';
import { inventory } from './inventory.js';
import { mkdir, CACHE_DIR, OUTPUT_DIR } from './helpers.js';

function main() {
  mkdir(OUTPUT_DIR);
  mkdir(CACHE_DIR);

  Promise.all([
    topology(),
    //gfs(),
    inventory(),
  ]).then(() => console.log('Data processing complete.'));
}

main();
