import topology from './topology.js';
import inventory from './inventory.js';
import locations from './locations.js';
import { mkdir, CACHE_DIR, OUTPUT_DIR } from './helpers.js';

(async function() {
  mkdir(OUTPUT_DIR);
  mkdir(CACHE_DIR);

  try {
    await Promise.all([
      topology(),
      inventory(),
      locations(),
    ]);
    console.log('Data processing complete.');

  } catch (e) {
    console.log('\nPlease fix this script.\n\nExiting...');
    process.exit(1);
  }
})();
