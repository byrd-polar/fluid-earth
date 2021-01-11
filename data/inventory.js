import { writeFile } from 'fs/promises';
import { OUTPUT_DIR } from './helpers.js';
import path from 'path';

const gfsSharedValues = {
  bytesPerFile: 2076480,
  width: 1440,
  height: 721,
  start: '2020-01-01T00:00:00.000Z',
  end: '2021-01-06T12:00:00.000Z', // hardcoded for now
  intervalInHours: 6,
}

const inventoryJSON = [
  {
    path: '/data/topology.json',
    name: 'topology',
    lastUpdated: '2018-05-21',
    bytes: 1207774,
  },
  {
    path: '/data/gfs-0p25-wind-speed-10m/',
    name: 'wind speed',
    description: 'wind speed at 10m above ground level',
    units: 'm/s',
    domain: [0, 35],
    colormap: 'VIRIDIS',
    ...gfsSharedValues,
  },
  {
    uPath: '/data/gfs-0p25-u-wind-velocity-10m/',
    vPath: '/data/gfs-0p25-v-wind-velocity-10m/',
    name: 'wind velocities',
    description: 'wind at 10m above ground level',
    particleLifetime: 1000,
    particleCount: 1e5,
    particleDisplay: {
      size: 0.8,
      rate: 5e4,
      opacity: 0.4,
      fade: 0.96,
    },
    ...gfsSharedValues,
  },
  {
    path: '/data/gfs-0p25-temperature-surface/',
    name: 'temperature',
    description: 'temperature at ground level',
    units: 'K',
    domain: [273.15 - 70, 273.15 + 70],
    colormap: 'TEMP',
    ...gfsSharedValues,
  },
];

export default async function() {
  let outputFile = path.join(OUTPUT_DIR, 'inventory.json');

  console.log(`Generating inventory...\n=> ${outputFile}\n`);
  await writeFile(outputFile, JSON.stringify(inventoryJSON));
}
