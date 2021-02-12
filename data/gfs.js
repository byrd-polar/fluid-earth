import * as util from './utility.js';
import { DateTime } from "luxon";
import { readFile, mkdir } from 'fs/promises';
import path from 'path';
import { promisify } from 'util';
import { execFile as _execFile } from 'child_process';
import _parseCSV from 'csv-parse';
const parseCSV = promisify(_parseCSV);
const execFile = promisify(_execFile);

const gfs0p25props = {
  bytesPerFile: 2076480,
  width: 1440,
  height: 721,
  intervalInHours: 6,
};

const simpleScript = path.join('data', 'scripts', 'gfs-to-fp16.js');
const simpleGribs = [
  {
    dataDir: 'gfs-0p25-temperature-2m/',
    parameter: 'TMP',
    level: '2 m above ground',
    datasetBase: {
      name: 'temperature',
      description: 'temperature at 2m above ground',
      unit: 'tempC',
      originalUnit: 'tempK',
      domain: [273.15 - 80, 273.15 + 55],
      colormap: 'MAGMA',
      ...gfs0p25props,
    },
  },
];

const compoundGribs = [
  {
    uParameter: 'UGRD',
    vParameter: 'VGRD',
    uDataDir: 'gfs-0p25-u-wind-velocity-10m/',
    vDataDir: 'gfs-0p25-v-wind-velocity-10m/',
    level: '10 m above ground',
    datasetBase: {
      name: 'wind velocities',
      description: 'wind at 10m above ground',
      particleLifetime: 1000,
      particleCount: 100000,
      particleDisplay: {
        size: 0.8,
        rate: 50000,
        opacity: 0.4,
        fade: 0.96
      },
      ...gfs0p25props,
    },
  },
];

const now = DateTime.utc();

let [inventory, writeAndUnlockInventory] = await util.lockAndReadInventory();

const _ds = inventory.find(d => d.name === 'temperature');
let dt = DateTime.fromISO(_ds?.end, {zone: 'utc'})
  .plus({hours: _ds?.intervalInHours});
if (!_ds) dt = DateTime.utc(now.year, now.month, now.day).minus({days: 3});

const _year = dt.year;
const _month = dt.toFormat('LL');
const _day = dt.toFormat('dd');
const _hour = dt.toFormat('HH');
const dataURL = 'https://ftpprd.ncep.noaa.gov/data/nccf/com/gfs/prod/' +
  `gfs.${_year}${_month}${_day}/${_hour}/gfs.t${_hour}z.pgrb2.0p25.f000`;

const _indexURL = dataURL + '.idx';
const _indexFile = await util.download(_indexURL, true);
const _indexString = await readFile(_indexFile, 'utf-8');
const index = await parseCSV(_indexString, { delimiter: ':' });

// download GFS grib file using HTTP Range Requests
async function downloadGrib(parameter, level) {
  let i = index.findIndex((row) => row[3] == parameter && row[4] == level);
  if (i === -1) throw 'Could not find GFS parameter and level combination.';

  let start = index[i][1];
  let end = index[i+1] === undefined ? '' : index[i+1][1] - 1;

  return await util.download(
    dataURL, true, `_${parameter}_${level}`, {Range: `bytes=${start}-${end}`}
  );
}

for (const grib of simpleGribs) {
  const inputFile = await downloadGrib(grib.parameter, grib.level);
  const outputPath = path.join(util.OUTPUT_DIR, grib.dataDir);

  await mkdir(outputPath, { mode: '775', recursive: true });
  await execFile(
    'node',
    [simpleScript, inputFile, util.join(outputPath, dt.toISO()) + '.fp16'],
  );

  let dataset = inventory.find(d => d.path === util.browserPath(outputPath));
  if (!dataset) inventory.push(dataset = grib.datasetBase);

  for (const prop in grib.datasetBase) dataset[prop] = grib.datasetBase[prop];

  dataset.path = util.browserPath(outputPath);
  dataset.start = dataset.start ?? dt;
  dataset.end = dt;
}

// same as simbleGribs loop above, except with split input and output variables
for (const grib of compoundGribs) {
  const uInputFile = await downloadGrib(grib.uParameter, grib.level);
  const vInputFile = await downloadGrib(grib.vParameter, grib.level);
  const uOutputPath = path.join(util.OUTPUT_DIR, grib.uDataDir);
  const vOutputPath = path.join(util.OUTPUT_DIR, grib.vDataDir);

  await mkdir(uOutputPath, { mode: '775', recursive: true });
  await mkdir(vOutputPath, { mode: '775', recursive: true });
  await execFile(
    'node',
    [simpleScript, uInputFile, util.join(uOutputPath, dt.toISO()) + '.fp16']
  );
  await execFile(
    'node',
    [simpleScript, vInputFile, util.join(vOutputPath, dt.toISO()) + '.fp16']
  );

  let dataset = inventory.find(d => d.uPath === util.browserPath(uOutputPath));
  if (!dataset) inventory.push(dataset = grib.datasetBase);

  for (const prop in grib.datasetBase) dataset[prop] = grib.datasetBase[prop];

  dataset.uPath = util.browserPath(uOutputPath);
  dataset.vPath = util.browserPath(vOutputPath);
  dataset.start = dataset.start ?? dt;
  dataset.end = dt;
}

await writeAndUnlockInventory(inventory);
