import { writeFile } from 'fs/promises';
import { OUTPUT_DIR } from './helpers.js';
import path from 'path';

const gfsSharedValues = {
  bytesPerFile: '2076480',
  start: '2020-11-01T00:00Z',
  intervalInHours: 3,
}

const inventoryJSON = {
  topology: {
    lastUpdated: '2018-05-21',
    bytes: '1207774',
  },
  'gfs-0p25-temperature-surface': gfsSharedValues,
  'gfs-0p25-u-wind-velocity-10m': gfsSharedValues,
  'gfs-0p25-v-wind-velocity-10m': gfsSharedValues,
  'gfs-0p25-wind-speed-10m': gfsSharedValues,
}

export async function inventory() {
  gfsSharedValues.end = '2020-11-14T12:00Z'; // hardcoded for now

  let outputFile = path.join(OUTPUT_DIR, 'inventory.json');

  console.log(`Generating inventory...\n=> ${outputFile}\n`);
  await writeFile(outputFile, JSON.stringify(inventoryJSON));
}
