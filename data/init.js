import { existsSync } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import { CACHE_DIR, OUTPUT_DIR, INVENTORY_FILE } from './utility.js';

await mkdir(CACHE_DIR, { mode: '775', recursive: true });
await mkdir(OUTPUT_DIR, { mode: '775', recursive: true });
await writeFile(INVENTORY_FILE, '[]');
