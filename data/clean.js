import { rm } from 'fs/promises';
import { hostname } from 'os';
import { log, CACHE_DIR, OUTPUT_DIR } from './utility.js';

if (hostname() === 'fever.byrd.osu.edu') {
  console.error('Refusing to delete directories on production server.');
  process.exit(1);
}

log('Deleting directories', [CACHE_DIR, OUTPUT_DIR]);
await rm(CACHE_DIR, { recursive: true, force: true });
await rm(OUTPUT_DIR, { recursive: true, force: true });
