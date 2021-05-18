import * as util from './utility.js';
import { DateTime } from "luxon";
import { mkdir } from 'fs/promises';
import path from 'path';
import { promisify } from 'util';
import { execFile as _execFile } from 'child_process';
const execFile = promisify(_execFile);



function daysPast(dateTime){ // Calculates the number of days that have past since October 5, 1992.
  var startDate = DateTime.utc(1992, 10, 5);
  const date1utc = DateTime.utc(startDate.year, startDate.month, startDate.day);
  const date2utc = DateTime.utc(dateTime.year, dateTime.month, dateTime.day);
  var timeDifference = (date2utc - date1utc)/(1000*60*60*24);
  return timeDifference;
}

const uOutputPath = path.join(util.OUTPUT_DIR, 'oscar-u-sea-surface-currents-velocity/');
const vOutputPath = path.join(util.OUTPUT_DIR, 'oscar-v-sea-surface-currents-velocity/');
const speedOutputPath = path.join(util.OUTPUT_DIR, 'oscar-sea-surface-currents-speed/');

const velocityDatasetBase = {
  name: "sea surface currents velocity",
  uPath: util.browserPath(uOutputPath),
  vPath: util.browserPath(vOutputPath),
  description: "ocean surface current velocity",
  particleLifetime: 1000,
  particleCount: 100000,
  particleDisplay: {
    size: 0.8,
    rate: 50000, // ????
    opacity: 0.4,
    fade: 0.96
  },
  bytesPerFile: 1155362,
  width: 400, // ????
  height: 161, // ????
  intervalInHours: 120, // ????
  projection: "OSCAR",
};
const speedDatasetBase = {
  name: 'sea surface currents speed',
  path: util.browserPath(speedOutputPath),
  unit: 'm/s',
  originalUnit: 'm/s',
  domain: [0.0, 1.5],
  colormap: 'CURRENTS',
  bytesPerFile: 1155362,
  width: 400, // ????
  height: 161, // ????
  intervalInHours: 120, // ????
  projection: 'OSCAR',
};



const [inventory, writeAndUnlockInventory] = await util.lockAndReadInventory();

// Set up directories to receive output files.
await mkdir(uOutputPath, { mode: '775', recursive: true });
await mkdir(vOutputPath, { mode: '775', recursive: true });
await mkdir(speedOutputPath, { mode: '775', recursive: true });

// Get an interval in days equaling 1/72nd of the current year.
const thisYear = new Date().getUTCFullYear;
const daysThisYear = ( (0 == thisYear % 4) && (0 != thisYear % 100) || (0 == thisYear % 400) ) ? 366 : 365;
let interval = (daysThisYear/72);

// Starting at Jan 1 this year, get an array of dates separated by that interval, expressed as days past October 5, 1992.
let datetimes = [];
let daysPastDatetimes = [];
for(let i =0; i <= 71; i++){
  let dt = DateTime.utc();
  dt = dt.set({ month: 1, day: 1 });
  dt = dt.plus({ day: (Math.floor(i*interval)) });
  if (dt > DateTime.utc().minus({ day: 1 })) { break; } // Exclude today and future dates. (We exclude today because today's file will not yet be available.)
  datetimes.push(dt);
  daysPastDatetimes.push(daysPast(dt));
}
console.log(daysPastDatetimes);


// Download and convert the most recent available file.
let outputDt = datetimes[datetimes.length-1];
let outputDaysPastDt = daysPastDatetimes[datetimes.length-1];
const inputFile = await util.download('https://podaac-opendap.jpl.nasa.gov/opendap/allData/oscar/'+
'preview/L4/oscar_third_deg/oscar_vel'+ outputDaysPastDt +'.nc.gz', true);
const uOutputFile = util.join(uOutputPath, outputDt.toISODate() + 'T00_00_00.000Z.fp16');
const vOutputFile = util.join(vOutputPath, outputDt.toISODate() + 'T00_00_00.000Z.fp16');
const speedOutputFile = util.join(speedOutputPath, outputDt.toISODate() + 'T00_00_00.000Z.fp16');

util.log('Converting netcdf to fp16', inputFile, 'u', uOutputFile);
await execFile('node', ['data/scripts/netcdf-to-fp16.js', inputFile, uOutputFile, 'u']);

util.log('Converting netcdf to fp16', inputFile, 'v', vOutputFile);
await execFile('node', ['data/scripts/netcdf-to-fp16.js', inputFile, vOutputFile, 'v']);

util.log('Converting netcdf grib to fp16', inputFile, speedOutputFile);
await execFile('node', ['data/scripts/netcdf-speed-to-fp16.js', inputFile, speedOutputFile]);



// Update the inventory.
let dataset;
let datetime;
const now = DateTime.utc();

dataset = inventory.find(d => d.uPath === velocityDatasetBase.uPath);
if (dataset) {
  datetime = DateTime.fromISO(dataset.end, {zone: 'utc'}).plus({day: 1}); // How often do we rerun?
} else {
  datetime = DateTime.utc(now.year, now.month, now.day).minus({days: 1}); // Why yesterday instead of today?
  inventory.push(dataset = velocityDatasetBase);
}
for (const prop in velocityDatasetBase) dataset[prop] = velocityDatasetBase[prop];
dataset.start = dataset.start ?? datetime;
dataset.end = datetime;
dataset.lastForecast = datetime;

dataset = inventory.find(d => d.uPath === speedDatasetBase.path);
if (dataset) {
  datetime = DateTime.fromISO(dataset.end, {zone: 'utc'}).plus({day: 1}); // How often do we rerun?
} else {
  datetime = DateTime.utc(now.year, now.month, now.day).minus({days: 1}); // Why yesterday instead of today?
  inventory.push(dataset = speedDatasetBase);
}
for (const prop in speedDatasetBase) dataset[prop] = speedDatasetBase[prop];
dataset.start = dataset.start ?? datetime;
dataset.end = datetime;
dataset.lastForecast = datetime;




await writeAndUnlockInventory(inventory);