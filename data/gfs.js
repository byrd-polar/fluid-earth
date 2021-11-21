import * as util from './utility.js';
import { DateTime } from "luxon";
import { readFile, mkdir } from 'fs/promises';
import path from 'path';
import got from 'got';
import pThrottle from 'p-throttle';
import { promisify } from 'util';
import { execFile as _execFile } from 'child_process';
import _parseCSV from 'csv-parse';
const parseCSV = promisify(_parseCSV);
const execFile = promisify(_execFile);

// Rate-limit https://ftpprd.ncep.noaa.gov calls to 120/min in accordance with
// https://www.weather.gov/media/notification/pdf2/scn21-32nomad_changes.pdf
const throttle = pThrottle({
  limit: 111,
  interval: 65 * 1000,
  strict: true,
});
const throttled = throttle(got);

const simpleScript = path.join('data', 'scripts', 'gfs-to-fp16.js');
const speedScript = path.join('data', 'scripts', 'gfs-wind-to-fp16.js');
const accScript = path.join('data', 'scripts', 'gfs-acc-to-fp16.js');


const GDAS_FORECAST_HRS = 9;
const GFS_FORECAST_HRS = 120;

const gfs0p25props = {
  bytesPerFile: 2076480,
  width: 1440,
  height: 721,
  intervalInHours: 1,
  forecastIntervalInHours: 6,
  projection: 'GFS',
};

const mbLevels = [850, 500, 300, 200, 10].map(x => `${x} mb`);

const simpleGribs = [];

for (const level of ['2 m above ground'].concat(mbLevels)) {
  simpleGribs.push({
    dataDir: `gfs-0p25-temperature-${level.replace(/ /g, '-')}/`,
    parameter: 'TMP',
    level: level,
    datasetBase: {
      name: `temperature at ${level}`,
      unit: 'tempC',
      originalUnit: 'tempK',
      domain: [273.15 - 80, 273.15 + 55],
      colormap: 'MAGMA',
      ...gfs0p25props,
    },
  });
}

simpleGribs.push({
  dataDir: 'gfs-0p25-total-relative-humidity/',
  parameter: 'RH',
  level: 'entire atmosphere (considered as a single layer)',
  datasetBase: {
    name: 'total relative humidity',
    unit: '%',
    originalUnit: '%',
    domain: [0, 100],
    colormap: 'CREST',
    ...gfs0p25props,
  },
});

for (const level of ['2 m above ground'].concat(mbLevels)) {
  simpleGribs.push({
    dataDir: `gfs-0p25-relative-humidity-${level.replace(/ /g, '-')}/`,
    parameter: 'RH',
    level: level,
    datasetBase: {
      name: `relative humidity at ${level}`,
      unit: '%',
      originalUnit: '%',
      domain: [0, 100],
      colormap: 'CREST',
      ...gfs0p25props,
    },
  });
}

simpleGribs.push({
  dataDir: 'gfs-0p25-mean-sea-level-pressure/',
  parameter: 'PRMSL',
  level: 'mean sea level',
  factor: 1000,
  datasetBase: {
    name: 'mean sea level pressure',
    unit: 'hPa',
    originalUnit: 'kPa',
    domain: [101.325 - 4, 101.325 + 4],
    colormap: 'ICEFIRE',
    ...gfs0p25props,
  },
});

simpleGribs.push({
  dataDir: 'gfs-0p25-convective-available-potential-energy-surface/',
  parameter: 'CAPE',
  level: 'surface',
  datasetBase: {
    name: 'convective available potential energy at surface',
    unit: 'J/kg',
    originalUnit: 'J/kg',
    domain: [0, 5000],
    colormap: 'INFERNO',
    ...gfs0p25props,
  },
});

simpleGribs.push({
  dataDir: 'gfs-0p25-total-precipitable-water/',
  parameter: 'PWAT',
  level: 'entire atmosphere (considered as a single layer)',
  datasetBase: {
    name: 'total precipitable water',
    unit: 'kg/m^2',
    originalUnit: 'kg/m^2',
    domain: [0, 70],
    colormap: 'MAKO_REVERSED',
    ...gfs0p25props,
  },
});

simpleGribs.push({
  dataDir: 'gfs-0p25-total-cloud-water/',
  parameter: 'CWAT',
  level: 'entire atmosphere (considered as a single layer)',
  datasetBase: {
    name: 'total cloud water',
    unit: 'kg/m^2',
    originalUnit: 'kg/m^2',
    domain: [0.0, 1.0],
    colormap: 'BLUES_REVERSED',
    ...gfs0p25props,
  },
});

simpleGribs.push({
  dataDir: 'gfs-0p25-total-ozone/',
  parameter: 'TOZNE',
  level: 'entire atmosphere (considered as a single layer)',
  datasetBase: {
    name: 'total ozone',
    unit: 'DU',
    originalUnit: 'DU',
    domain: [200, 600],
    colormap: 'VIRIDIS',
    ...gfs0p25props,
  },
});

for (const level of ['surface'].concat(mbLevels)) {
  simpleGribs.push({
    dataDir: `gfs-0p25-geopotential-height-${level.replace(/ /g, '-')}/`,
    parameter: 'HGT',
    level: level,
    factor: 1000,
    datasetBase: {
      name: `geopotential height at ${level}`,
      unit: 'km',
      originalUnit: 'km',
      domain: [0, 32],
      colormap: 'TURBO',
      ...gfs0p25props,
    },
  });
}

simpleGribs.push({
  dataDir: 'gfs-0p25-significant-wave-height/',
  parameter: 'HTSGW',
  level: 'surface',
  wave: true,
  datasetBase: {
    name: 'significant wave height', // of combined wind waves and swell waves
    unit: 'm',
    originalUnit: 'm',
    domain: [0, 12],
    colormap: 'GN_BU_REVERSED',
    ...gfs0p25props,
  },
});

simpleGribs.push({
  dataDir: 'gfs-0p25-primary-wave-mean-period/',
  parameter: 'PERPW',
  level: 'surface',
  wave: true,
  datasetBase: {
    name: 'primary wave mean period',
    unit: 's',
    originalUnit: 's',
    domain: [0, 22],
    colormap: 'PU_BU_GN',
    ...gfs0p25props,
  },
});

simpleGribs.push({
  dataDir: 'gfs-0p25-primary-wave-direction/',
  parameter: 'DIRPW',
  level: 'surface',
  wave: true,
  datasetBase: {
    name: 'primary wave direction (from)',
    unit: 'deg',
    originalUnit: 'deg',
    domain: [0, 360],
    colormap: 'RAINBOW',
    ...gfs0p25props,
  },
});

const speedGribs = [];

for (const level of ['10 m above ground'].concat(mbLevels)) {
  speedGribs.push({
    uParameter: 'UGRD',
    vParameter: 'VGRD',
    dataDir: `gfs-0p25-wind-speed-${level.replace(/ /g, '-')}/`,
    level: level,
    datasetBase: {
      name: `wind speed at ${level}`,
      unit: 'km/h',
      originalUnit: 'm/s',
      domain: [0, 100],
      colormap: 'TURBO',
      ...gfs0p25props,
    },
  });
}

const compoundGribs = [];

for (const level of ['10 m above ground'].concat(mbLevels)) {
  compoundGribs.push({
    uParameter: 'UGRD',
    vParameter: 'VGRD',
    uDataDir: `gfs-0p25-u-wind-velocity-${level.replace(/ /g, '-')}/`,
    vDataDir: `gfs-0p25-v-wind-velocity-${level.replace(/ /g, '-')}/`,
    level: level,
    datasetBase: {
      name: `wind at ${level}`,
      particleLifetime: 2000,
      particleCount: 100000,
      particleDisplay: {
        size: 0.8,
        rate: 25000,
        opacity: 0.3,
        opacitySpeedDecay: 0.8,
        fade: 0.98
      },
      ...gfs0p25props,
    },
  });
}

const accumulationGribs = [];

accumulationGribs.push({
  dataDir: 'gfs-0p25-1-hour-precipitation/',
  parameter: 'APCP',
  level: 'surface',
  datasetBase: {
    name: 'precipitation in previous hour',
    unit: 'kg/m^2',
    originalUnit: 'kg/m^2',
    domain: [0, 50],
    colormap: 'TURBO',
    ...gfs0p25props,
  },
});

const accumulation6hrGribs = [];

accumulation6hrGribs.push({
  dataDir: 'gfs-0p25-sunshine-duration/',
  parameter: 'SUNSD',
  level: 'surface',
  datasetBase: {
    name: 'sunshine in previous hour',
    unit: 'min',
    originalUnit: 's',
    domain: [0, 3600],
    colormap: 'SUNSHINE',
    ...gfs0p25props,
  },
});


const [inventory, writeInventory] = await util.readPartialInventory('gfs');
const [datetime, system] = await getDatetimeAndSystem(inventory);

const forecastHours = system === 'gdas' ? GDAS_FORECAST_HRS : GFS_FORECAST_HRS;

// determine the URL to download from
function getDataURL(system, datetime, forecast, wave) {
  const year = datetime.year;
  const month = datetime.toFormat('LL');
  const day = datetime.toFormat('dd');
  const hour = datetime.toFormat('HH');
  const fNum = forecast.toString().padStart(3, '0');

  if (wave) {
    return 'https://ftpprd.ncep.noaa.gov/data/nccf/com/gfs/prod/' +
      `${system}.${year}${month}${day}/${hour}/wave/gridded/` +
      `${system}wave.t${hour}z.global.0p25.f${fNum}.grib2`;
  }

  return 'https://ftpprd.ncep.noaa.gov/data/nccf/com/gfs/prod/' +
    `${system}.${year}${month}${day}/${hour}/atmos/` +
    `${system}.t${hour}z.pgrb2.0p25.f${fNum}`;
}

// determine when and where to find forecast grib files from
async function getDatetimeAndSystem() {
  let datetime, system;

  const outputPath = path.join(util.OUTPUT_DIR, simpleGribs[0].dataDir);
  const datasetPath = util.browserPath(outputPath);

  const dataset = inventory.find(d => d.path === datasetPath);
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
    datetime = DateTime.utc(now.year, now.month, now.day).minus({days: 0.5});
    system = 'gdas';
  }
  return [datetime, system];
}

// download GFS grib file using HTTP Range Requests
async function downloadGrib(forecast, parameter, level, fcst=null, wave=false) {
  const dataURL = getDataURL(system, datetime, forecast, wave);
  const indexURL = dataURL + '.idx';
  const indexFile = await util.download(indexURL, true, '', {}, throttled);
  const indexString = await readFile(indexFile, 'utf-8');
  const index = await parseCSV(indexString, { delimiter: ':' });

  const i = index.findIndex((row) => {
    return row[3] == parameter && row[4] == level && (!fcst || row[5] == fcst);
  });
  if (i === -1) throw 'Could not find GFS parameter-level-fcst combination.';

  const start = index[i][1];
  const end = index[i+1] === undefined ? '' : index[i+1][1] - 1;

  return await util.download(
    dataURL, true, `_${parameter}_${level}`, {Range: `bytes=${start}-${end}`},
    throttled
  );
}

for (const grib of simpleGribs) {
  const factor = grib.factor ?? 1;
  const outputPath = path.join(util.OUTPUT_DIR, grib.dataDir);
  await mkdir(outputPath, { mode: '775', recursive: true });

  for (let f = 0; f <= forecastHours; f++) {
    const inputFile =
      await downloadGrib(f, grib.parameter, grib.level, null, grib.wave);
    const filename = datetime.plus({hours: f}).toISO() + '.fp16.br';
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
    const filename = datetime.plus({hours: f}).toISO() + '.fp16.br';
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

    const filename = datetime.plus({hours: f}).toISO() + '.fp16.br';
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

// same as simbleGribs loop above, except with split input variables, offset
// start time, and fcst download param
for (const grib of accumulationGribs) {
  const outputPath = path.join(util.OUTPUT_DIR, grib.dataDir);
  await mkdir(outputPath, { mode: '775', recursive: true });

  // first file doesn't need a special script (only one input file)
  const inputFile =
    await downloadGrib(1, grib.parameter, grib.level, fcstString(1));
  const filename = datetime.plus({hours: 1}).toISO() + '.fp16.br';
  const outputFile = util.join(outputPath, filename);

  util.log('Converting GFS grib to fp16', inputFile, outputFile);
  await execFile('node', [simpleScript, inputFile, outputFile]);

  for (let f = 2; f <= forecastHours; f++) {
    const inputFiles = [
      await downloadGrib(f-1, grib.parameter, grib.level, fcstString(f-1)),
      await downloadGrib(f, grib.parameter, grib.level, fcstString(f)),
    ];
    const filename = datetime.plus({hours: f}).toISO() + '.fp16.br';
    const outputFile = util.join(outputPath, filename);

    util.log('Converting GFS grib to fp16', inputFiles, outputFile);
    await execFile('node', [accScript, ...inputFiles, outputFile]);
  }

  let dataset = inventory.find(d => d.path === util.browserPath(outputPath));
  if (!dataset) inventory.push(dataset = grib.datasetBase);

  for (const prop in grib.datasetBase) dataset[prop] = grib.datasetBase[prop];

  dataset.path = util.browserPath(outputPath);
  setDatasetTimeProps(dataset, 1);
}

// similar to accumulationGribs loop above, except accumulation resets every 6
// hours
for (const grib of accumulation6hrGribs) {
  const outputPath = path.join(util.OUTPUT_DIR, grib.dataDir);
  await mkdir(outputPath, { mode: '775', recursive: true });

  for (let f = 1; f <= forecastHours; f++) {
    if (f % 6 === 1) {
      const inputFile = await downloadGrib(f, grib.parameter, grib.level);
      const filename = datetime.plus({hours: f}).toISO() + '.fp16.br';
      const outputFile = util.join(outputPath, filename);

      util.log('Converting GFS grib to fp16', inputFile, outputFile);
      await execFile('node', [simpleScript, inputFile, outputFile]);

    } else {
      const inputFiles = [
        await downloadGrib(f-1, grib.parameter, grib.level),
        await downloadGrib(f, grib.parameter, grib.level),
      ];
      const filename = datetime.plus({hours: f}).toISO() + '.fp16.br';
      const outputFile = util.join(outputPath, filename);

      util.log('Converting GFS grib to fp16', inputFiles, outputFile);
      await execFile('node', [accScript, ...inputFiles, outputFile]);
    }
  }

  let dataset = inventory.find(d => d.path === util.browserPath(outputPath));
  if (!dataset) inventory.push(dataset = grib.datasetBase);

  for (const prop in grib.datasetBase) dataset[prop] = grib.datasetBase[prop];

  dataset.path = util.browserPath(outputPath);
  setDatasetTimeProps(dataset, 1);
}

// set the common props derived from datetime and system
function setDatasetTimeProps(dataset, offset=0) {
  dataset.start = dataset.start ?? datetime.plus({hours: offset});
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

function fcstString(f) {
  return (f % 24 === 0 ? `0-${f/24} day` : `0-${f} hour`) + ' acc fcst';
}

await writeInventory(inventory);
