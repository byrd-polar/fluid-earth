import { writeFile } from 'fs/promises';
import { OUTPUT_DIR } from './helpers.js';
import path from 'path';

const gfsSharedValues = {
  bytesPerFile: 2076480,
  start: '2020-08-05T00:00:00.000Z',
  end: '2020-08-08T18:00:00.000Z', // hardcoded for now
  intervalInHours: 6,
}

const inventoryJSON = {
  '/data/topology.json': {
    lastUpdated: '2018-05-21',
    bytes: 1207774,
  },
  '/data/gfs-0p25-temperature-surface/': {
    name: 'surface temperature',
    description: 'Temperature at ground level',
    units: 'K',
    domain: [273.15 - 70, 273.15 + 70],
    colormap: 'MAGMA',
    ...gfsSharedValues,
  },
  '/data/gfs-0p25-u-wind-velocity-10m/': {
    name: 'u-wind velocity',
    description: 'Wind velocity west to east at 10m above ground level',
    units: 'm/s',
    domain: [-35, 35],
    colormap: 'BR_BG',
    ...gfsSharedValues,
  },
  '/data/gfs-0p25-v-wind-velocity-10m/': {
    name: 'v-wind velocity',
    description: 'Wind velocity south to north at 10m above ground level',
    units: 'm/s',
    domain: [-35, 35],
    colormap: 'PR_GN',
    ...gfsSharedValues,
  },
  '/data/gfs-0p25-wind-speed-10m/': {
    name: 'wind speed',
    description: 'Wind speed at 10m above ground level',
    units: 'm/s',
    domain: [0, 35],
    colormap: 'VIRIDIS',
    ...gfsSharedValues,
  },
}

export default async function() {
  let outputFile = path.join(OUTPUT_DIR, 'inventory.json');

  console.log(`Generating inventory...\n=> ${outputFile}\n`);
  await writeFile(outputFile, JSON.stringify(inventoryJSON));
}
