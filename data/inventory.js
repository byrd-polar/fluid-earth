import { writeFile } from 'fs/promises';
import { OUTPUT_DIR } from './helpers.js';
import path from 'path';

const gfsSharedValues = {
  bytesPerFile: 2076480,
  start: '2020-08-05T00:00:00.000Z.fp16',
  intervalInHours: 3,
}

const inventoryJSON = {
  '/data/topology.json': {
    lastUpdated: '2018-05-21',
    bytes: '1207774',
  },
  '/data/gfs-0p25-temperature-surface/': gfsSharedValues,
  '/data/gfs-0p25-u-wind-velocity-10m/': gfsSharedValues,
  '/data/gfs-0p25-v-wind-velocity-10m/': gfsSharedValues,
  '/data/gfs-0p25-wind-speed-10m/': gfsSharedValues,
}

export async function inventory() {
  gfsSharedValues.end = '2020-08-08T18:00:00.000Z.fp16'; // hardcoded for now

  let outputFile = path.join(OUTPUT_DIR, 'inventory.json');

  console.log(`Generating inventory...\n=> ${outputFile}\n`);
  await writeFile(outputFile, JSON.stringify(inventoryJSON));
}
