import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { log, CACHE_DIR, OUTPUT_DIR, INVENTORY_FILE, PARTIAL_INVENTORIES
} from './utility.js';

log('Initializing data', [], [CACHE_DIR, OUTPUT_DIR, INVENTORY_FILE]);
await mkdir(CACHE_DIR, { mode: '775', recursive: true });
await mkdir(OUTPUT_DIR, { mode: '775', recursive: true });

if (existsSync(INVENTORY_FILE)) {
  console.error(`Refusing to overwrite existing file: ${INVENTORY_FILE}`);
  console.error('Manually delete this file to proceed.\n');
  process.exit(1);
}

await writeFile(INVENTORY_FILE, '[]');
for (const file of Object.values(PARTIAL_INVENTORIES)) {
  await writeFile(file, '[]');
}
