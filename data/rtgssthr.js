import * as util from './utility.js';
import { DateTime } from "luxon";
import { mkdir } from 'fs/promises';
import path from 'path';
import { promisify } from 'util';
import { execFile as _execFile } from 'child_process';
const execFile = promisify(_execFile);

const outputPath = path.join(util.OUTPUT_DIR, 'rtgssthr-0p083/');
const datasetBase = {
  name: 'sea surface temperature',
  path: util.browserPath(outputPath),
  unit: 'tempC',
  originalUnit: 'tempK',
  domain: [273.15 - 1.8, 273.15 + 31.5],
  colormap: 'THERMAL',
  bytesPerFile: 18662400,
  width: 4320,
  height: 2160,
  intervalInHours: 24,
  projection: 'RTGSSTHR',
};

const [inventory, writeInventory] = await util.readPartialInventory('rtgssthr');

let dataset = inventory.find(d => d.path === datasetBase.path);
let datetime;

if (dataset) {
  datetime = DateTime.fromISO(dataset.end, {zone: 'utc'}).plus({day: 1});
} else {
  const now = DateTime.utc();
  datetime = DateTime.utc(now.year, now.month, now.day).minus({days: 1});
  inventory.push(dataset = datasetBase);
}

const year = datetime.year;
const month = datetime.toFormat('LL');
const day = datetime.toFormat('dd');

const inputFile = await util.download(
  'https://ftpprd.ncep.noaa.gov/data/nccf/com/gfs/prod/' +
  `sst.${year}${month}${day}/rtgssthr_grb_0.083_awips.grib2`,
  true
);
await mkdir(outputPath, { mode: '775', recursive: true });

const outputFile = util.join(outputPath, datetime.toISO() + '.fp16.br');

util.log('Converting GFS grib to fp16', inputFile, outputFile);
const script = path.join('data', 'scripts', 'gfs-to-fp16.js');
await execFile('node', [script, inputFile, outputFile]);

for (const prop in datasetBase) dataset[prop] = datasetBase[prop];

dataset.start = dataset.start ?? datetime;
dataset.end = datetime;
dataset.lastForecast = datetime;

await writeInventory(inventory);
