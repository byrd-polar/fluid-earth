import { mkdir, writeFile } from 'fs/promises';
import { log, CACHE_DIR, OUTPUT_DIR, INVENTORY_FILE } from './utility.js';

log('Initializing data', [], [CACHE_DIR, OUTPUT_DIR, INVENTORY_FILE]);
await mkdir(CACHE_DIR, { mode: '775', recursive: true });
await mkdir(OUTPUT_DIR, { mode: '775', recursive: true });
await writeFile(INVENTORY_FILE, '[]');
