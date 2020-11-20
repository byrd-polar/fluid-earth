import { topology } from './topology.js';
import { gfs } from './gfs.js';
import { mkdir, CACHE_DIR, OUTPUT_DIR } from './helpers.js';

function main() {
  mkdir(OUTPUT_DIR);
  mkdir(CACHE_DIR);

  Promise.all([
    topology(),
    gfs(),
  ]).then(() => console.log('Data processing complete.'));
}

main();
