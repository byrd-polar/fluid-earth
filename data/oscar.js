import { validOscarDates } from '../src/utility.js';
import * as util from './utility.js';
import { DateTime } from 'luxon';
import { mkdir } from 'fs/promises';
import path from 'path';
import { promisify } from 'util';
import { execFile as _execFile } from 'child_process';
const execFile = promisify(_execFile);

const referenceDatetime = DateTime.fromISO('1992-10-05', {zone: 'utc'});

const script = path.join('data', 'scripts', 'netcdf-to-fp16.js');
const speedScript = path.join('data', 'scripts', 'netcdf-speed-to-fp16.js');

const uOutputPath = path.join(util.OUTPUT_DIR, 'oscar-u-velocity/');
const vOutputPath = path.join(util.OUTPUT_DIR, 'oscar-v-velocity/');
const datasetBase = {
  name: 'ocean surface currents',
  uPath: util.browserPath(uOutputPath),
  vPath: util.browserPath(vOutputPath),
  particleLifetime: 10000,
  particleCount: 100000,
  particleDisplay: {
    size: 0.8,
    rate: 250000,
    opacity: 0.4,
    opacitySpeedDecay: 0.005,
    fade: 0.96
  },
  bytesPerFile: 1155362,
  width: 1201,
  height: 481,
  intervalInHours: 'custom:OSCAR',
  projection: "OSCAR",
};

const sOutputPath = path.join(util.OUTPUT_DIR, 'oscar-speed/');
const speedDatasetBase = {
  name: 'ocean surface currents speed',
  path: util.browserPath(sOutputPath),
  unit: 'm/s',
  originalUnit: 'm/s',
  domain: [0.0, 1.5],
  colormap: 'CURRENTS',
  bytesPerFile: 1155362,
  width: 1201,
  height: 481,
  intervalInHours: 'custom:OSCAR',
  projection: 'OSCAR',
};

const [inventory, writeAndUnlockInventory] = await util.lockAndReadInventory();

let dataset = inventory.find(d => d.vPath === datasetBase.vPath);
let speedDataset = inventory.find(d => d.path === speedDatasetBase.path);
let datetime;

if (dataset) {
  const year = DateTime.fromISO(dataset.end, {zone: 'utc'}).year;
  const dates = validOscarDates(year).concat(validOscarDates(year + 1));
  datetime = DateTime.fromJSDate(
    dates.find(d => d > new Date(dataset.end)), {zone: 'utc'}
  );

} else {
  datetime = referenceDatetime.plus({days: 7001}); // earliest available input

  inventory.push(dataset = datasetBase);
  inventory.push(speedDataset = speedDatasetBase);
}

const inputFile = await util.download(
  'https://podaac-opendap.jpl.nasa.gov/' +
  'opendap/allData/oscar/preview/L4/oscar_third_deg/' +
  `oscar_vel${datetime.diff(referenceDatetime, 'days').days}.nc.gz`
);

await mkdir(uOutputPath, { mode: '775', recursive: true });
await mkdir(vOutputPath, { mode: '775', recursive: true });
await mkdir(sOutputPath, { mode: '775', recursive: true });

const uOutputFile = util.join(uOutputPath, datetime.toISO() + '.fp16');
const vOutputFile = util.join(vOutputPath, datetime.toISO() + '.fp16');
const sOutputFile = util.join(sOutputPath, datetime.toISO() + '.fp16');

util.log('Converting OSCAR NetCDF to fp16', inputFile, uOutputFile);
await execFile('node', [script, inputFile, uOutputFile, 'u']);

util.log('Converting OSCAR NetCDF to fp16', inputFile, vOutputFile);
await execFile('node', [script, inputFile, vOutputFile, 'v']);

util.log('Converting OSCAR NetCDF to fp16', inputFile, sOutputFile);
await execFile('node', [speedScript, inputFile, sOutputFile]);

for (const prop in datasetBase) dataset[prop] = datasetBase[prop];
for (const prop in speedDatasetBase) speedDataset[prop] = speedDatasetBase[prop];

dataset.start = dataset.start ?? datetime;
speedDataset.start = speedDataset.start ?? datetime;
dataset.end = datetime;
speedDataset.end = datetime;

await writeAndUnlockInventory(inventory);