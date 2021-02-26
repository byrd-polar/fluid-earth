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
  intervalInHours: 1,
  forecastIntervalInHours: 6,
  projection: 'GFS',
};

const simpleScript = path.join('data', 'scripts', 'gfs-to-fp16.js');
const speedScript = path.join('data', 'scripts', 'gfs-wind-to-fp16.js');

const simpleGribs = [
  {
    dataDir: 'gfs-0p25-temperature-2m/',
    parameter: 'TMP',
    level: '2 m above ground',
    datasetBase: {
      name: 'temperature',
      description: 'temperature at 2 m above ground',
      unit: 'tempC',
      originalUnit: 'tempK',
      domain: [273.15 - 80, 273.15 + 55],
      colormap: 'MAGMA',
      ...gfs0p25props,
    },
  },
  {
    dataDir: 'gfs-0p25-mslp/',
    parameter: 'PRMSL',
    level: 'mean sea level',
    factor: 100,
    datasetBase: {
      name: 'mean sea level',
      description: 'mean sea level pressure',
      unit: 'hPa',
      originalUnit: 'hPa',
      domain: [960, 1050],
      colormap: 'MEAN_SEA_LEVEL_PRESSURE',
      ...gfs0p25props,
    },
  },
  {
    dataDir: 'gfs-0p25-total-precipitable-water/',
    parameter: 'PWAT',
    level: 'entire atmosphere (considered as a single layer)',
    datasetBase: {
      name: 'total precipitable water',
      description: 'total precipitable water',
      unit: 'kg/m^2',
      originalUnit: 'kg/m^2',
      domain: [0, 70],
      colormap: 'TOTAL_PRECIP',
      ...gfs0p25props,
    },
  },
];

const speedGribs = [
  {
    uParameter: 'UGRD',
    vParameter: 'VGRD',
    dataDir: 'gfs-0p25-wind-speed-10m/',
    level: '10 m above ground',
    datasetBase: {
      name: 'wind speed',
      description: 'wind speed at 10 m above ground',
      unit: 'kph',
      originalUnit: 'm/s',
      domain: [0, 100],
      colormap: 'CUBEHELIX_DEFAULT',
      ...gfs0p25props,
    },
  }
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
      description: 'wind at 10 m above ground',
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


const [inventory, writeAndUnlockInventory] = await util.lockAndReadInventory();
const [datetime, system] = await getDatetimeAndSystem(inventory);

// can be up to 9 : 120 for GDAS and GFS, respectively
const forecastHours = system === 'gdas' ? 6 : 6;

// determine the URL to download from
function getDataURL(system, datetime, forecast) {
  const year = datetime.year;
  const month = datetime.toFormat('LL');
  const day = datetime.toFormat('dd');
  const hour = datetime.toFormat('HH');
  const fNum = forecast.toString().padStart(3, '0');
  return 'https://ftpprd.ncep.noaa.gov/data/nccf/com/gfs/prod/' +
    `${system}.${year}${month}${day}/${hour}/` +
    `${system}.t${hour}z.pgrb2.0p25.f${fNum}`;
}

// determine when and where to find forecast grib files from
async function getDatetimeAndSystem() {
  let datetime, system;

  const dataset = inventory.find(d => d.name === 'temperature');
  if (dataset) {

    if (dataset.lastForecastSystem === 'gfs') {
      datetime = DateTime.fromISO(dataset.lastForecast, {zone: 'utc'});
      system = 'gdas';

    } else {
      datetime = DateTime
        .fromISO(dataset.lastForecast, {zone: 'utc'})
        .plus({hours: dataset.forecastIntervalInHours});
      system = 'gfs';
    }
  } else {
    const now = DateTime.utc();
    datetime = DateTime.utc(now.year, now.month, now.day).minus({days: 1});
    system = 'gdas';
  }
  return [datetime, system];
}

// download GFS grib file using HTTP Range Requests
async function downloadGrib(forecast, parameter, level) {
  const dataURL = getDataURL(system, datetime, forecast);
  const indexURL = dataURL + '.idx';
  const indexFile = await util.download(indexURL, true);
  const indexString = await readFile(indexFile, 'utf-8');
  const index = await parseCSV(indexString, { delimiter: ':' });

  const i = index.findIndex((row) => row[3] == parameter && row[4] == level);
  if (i === -1) throw 'Could not find GFS parameter and level combination.';

  const start = index[i][1];
  const end = index[i+1] === undefined ? '' : index[i+1][1] - 1;

  return await util.download(
    dataURL, true, `_${parameter}_${level}`, {Range: `bytes=${start}-${end}`}
  );
}

for (const grib of simpleGribs) {
  const factor = grib.factor ?? 1;
  const outputPath = path.join(util.OUTPUT_DIR, grib.dataDir);
  await mkdir(outputPath, { mode: '775', recursive: true });

  for (let f = 0; f <= forecastHours; f++) {
    const inputFile = await downloadGrib(f, grib.parameter, grib.level);
    const filename = datetime.plus({hours: f}).toISO() + '.fp16';
    const outputFile = util.join(outputPath, filename);

    util.log('Converting GFS grib to fp16', inputFile, outputFile);
    await execFile('node', [simpleScript, inputFile, outputFile, factor]);
  }

  let dataset = inventory.find(d => d.path === util.browserPath(outputPath));
  if (!dataset) inventory.push(dataset = grib.datasetBase);

  for (const prop in grib.datasetBase) dataset[prop] = grib.datasetBase[prop];

  dataset.path = util.browserPath(outputPath);
  setDatasetTimeProps(dataset);
}

// same as simbleGribs loop except with split input variables
for (const grib of speedGribs) {
  const outputPath = path.join(util.OUTPUT_DIR, grib.dataDir);
  await mkdir(outputPath, { mode: '775', recursive: true });

  for (let f = 0; f <= forecastHours; f++) {
    const inputFiles = [
      await downloadGrib(f, grib.uParameter, grib.level),
      await downloadGrib(f, grib.vParameter, grib.level),
    ];
    const filename = datetime.plus({hours: f}).toISO() + '.fp16';
    const outputFile = util.join(outputPath, filename);

    util.log('Converting GFS grib to fp16', inputFiles, outputFile);
    await execFile('node', [speedScript, ...inputFiles, outputFile]);
  }

  let dataset = inventory.find(d => d.path === util.browserPath(outputPath));
  if (!dataset) inventory.push(dataset = grib.datasetBase);

  for (const prop in grib.datasetBase) dataset[prop] = grib.datasetBase[prop];

  dataset.path = util.browserPath(outputPath);
  setDatasetTimeProps(dataset);
}

// same as simbleGribs loop above, except with split input and output variables
for (const grib of compoundGribs) {
  const uOutputPath = path.join(util.OUTPUT_DIR, grib.uDataDir);
  const vOutputPath = path.join(util.OUTPUT_DIR, grib.vDataDir);
  await mkdir(uOutputPath, { mode: '775', recursive: true });
  await mkdir(vOutputPath, { mode: '775', recursive: true });

  for (let f = 0; f <= forecastHours; f++) {
    const uInputFile = await downloadGrib(f, grib.uParameter, grib.level);
    const vInputFile = await downloadGrib(f, grib.vParameter, grib.level);

    const filename = datetime.plus({hours: f}).toISO() + '.fp16';
    const uOutputFile = util.join(uOutputPath, filename);
    const vOutputFile = util.join(vOutputPath, filename);

    util.log('Converting GFS grib to fp16', uInputFile, uOutputFile);
    await execFile('node', [simpleScript, uInputFile, uOutputFile]);

    util.log('Converting GFS grib to fp16', vInputFile, vOutputFile);
    await execFile('node', [simpleScript, vInputFile, vOutputFile]);
  }

  let dataset = inventory.find(d => d.uPath === util.browserPath(uOutputPath));
  if (!dataset) inventory.push(dataset = grib.datasetBase);

  for (const prop in grib.datasetBase) dataset[prop] = grib.datasetBase[prop];

  dataset.uPath = util.browserPath(uOutputPath);
  dataset.vPath = util.browserPath(vOutputPath);
  setDatasetTimeProps(dataset);
}

// set the common props derived from datetime and system
function setDatasetTimeProps(dataset) {
  dataset.start = dataset.start ?? datetime;
  if (dataset.end) {
    dataset.end = DateTime.max(
      datetime.plus({hours: forecastHours}),
      DateTime.fromISO(dataset.end, {zone: 'utc'}),
    );
  } else {
    dataset.end = datetime.plus({hours: forecastHours});
  }
  dataset.lastForecast = datetime;
  dataset.lastForecastSystem = system;
}

await writeAndUnlockInventory(inventory);
