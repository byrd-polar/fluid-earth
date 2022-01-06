import { nextOscarDate } from '../src/oscar.js';
import * as util from './utility.js';
import { DateTime } from 'luxon';
import { HTTPError } from 'got';
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
  particleCount: 300000,
  particleDisplay: {
    size: 0.5,
    rate: 150000,
    opacity: 0.3,
    opacitySpeedDecay: 0.005,
    fade: 0.98
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
  domain: [0.0, 2.5],
  colormap: 'BLUES_REVERSED',
  bytesPerFile: 1155362,
  width: 1201,
  height: 481,
  intervalInHours: 'custom:OSCAR',
  projection: 'OSCAR',
};

const [inventory, writeInventory] = await util.readPartialInventory('oscar');

let dataset = inventory.find(d => d.vPath === datasetBase.vPath);
let speedDataset = inventory.find(d => d.path === speedDatasetBase.path);
let datetime;

if (dataset) {
  let date = nextOscarDate(new Date(dataset.end));
  datetime = DateTime.fromJSDate(date, {zone: 'utc'});

} else {
  datetime = referenceDatetime.plus({days: 7001}); // earliest available input

  inventory.push(dataset = datasetBase);
  inventory.push(speedDataset = speedDatasetBase);
}

let inputFile;
try {
  inputFile = await util.download(
    'https://podaac-opendap.jpl.nasa.gov/' +
    'opendap/allData/oscar/preview/L4/oscar_third_deg/' +
    `oscar_vel${datetime.diff(referenceDatetime, 'days').days}.nc.gz.nc4`
  );
} catch (e) {
  if ( e instanceof HTTPError
    && [404, 503].includes(e.response.statusCode)
  ) {
    console.log('\nIgnoring missing file or unresponsive server.');
    process.exit();
  }
  throw e;
}

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

await writeInventory(inventory);
