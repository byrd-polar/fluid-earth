import { rmdir } from 'fs/promises';
import { log, CACHE_DIR, OUTPUT_DIR } from './utility.js';

log('Deleting directories', [CACHE_DIR, OUTPUT_DIR]);
await rmdir(CACHE_DIR, { recursive: true });
await rmdir(OUTPUT_DIR, { recursive: true });
