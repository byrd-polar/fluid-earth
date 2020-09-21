import { download, OUTPUT_DIR, exit } from './index.js';
import { spawnSync } from 'child_process';
import path from 'path';
import { readFile } from 'fs/promises';

import { promisify } from 'util';

import _parseCSV from 'csv-parse';
const parseCSV = promisify(_parseCSV);

export async function gfs() {
  // from https://nomads.ncep.noaa.gov/pub/data/nccf/com/gfs/prod/
  let now = new Date();
  let year = now.getUTCFullYear();
  let month = (now.getUTCMonth() + 1).toString().padStart(2, '0');
  let day = (now.getUTCDate()).toString().padStart(2, '0');
  let hour = [18, 12, 6, 0].find(h => h <= now.getUTCHours());

  // use the previous forecast, to lazily avoid case where current forecast is
  // still processing
  hour = (hour - 6 + 24) % 24;
  hour = hour.toString().padStart(2, '0');
  if (hour === '18') {
    day = (day - 1).toString().padStart(2, '0');
  }

  const dataURL = 'https://nomads.ncep.noaa.gov/pub/data/nccf/com/gfs/prod/' +
    `gfs.${year}${month}${day}/${hour}/gfs.t${hour}z.pgrb2.0p25.f000`;
  const indexURL = dataURL + '.idx';

  // file containing information for partial downloads
  let indexFile = await download(indexURL, true);
  let indexString = await readFile(indexFile, 'utf-8');
  let index = await parseCSV(indexString, { delimiter: ':' });

  await saveGFS(dataURL, index, 'TMP', 'surface', 'gfs-temperature.f32');
  await saveGFS(dataURL, index, 'UGRD', '10 m above ground', 'gfs-u-wind.f32');
  await saveGFS(dataURL, index, 'VGRD', '10 m above ground', 'gfs-v-wind.f32');
}

// converts part of a Grib file from GFS to f32 format
async function saveGFS(url, index, parameter, level, filename) {
  let inputFile = await download(url, true, `_${parameter}_${level}`, {
    Range: getRange(index, parameter, level),
  });
  let outputFile = path.join(OUTPUT_DIR, filename);

  console.log(`Generating GFS data...\n${inputFile}\n=> ${outputFile}\n`);
  let wgrib2 = spawnSync(
    'wgrib2',
    [inputFile, '-bin', outputFile, '-no_header', '-order', 'raw' ]
  );

  if (wgrib2.status !== 0) {
    console.log(
      `Could not run wgrib2, skipping...\n=> ${wgrib2.stderr}\n`,
    );
  }
}

// print the parsed index file to make sense of this function
//
// returns the string needed for the HTTP Range Request header
function getRange(index, parameter, level) {
  let i = index.findIndex((row) => {
    return row[3] == parameter && row[4] == level;
  });

  if (i === -1) {
    console.log("Could not find GFS parameter and level combination in index.");
    exit();
  }

  let start = index[i][1];
  let end;
  if (index[i+1] === undefined) {
    end = '';
  } else {
    end = index[i+1][1] - 1;
  }
  return `bytes=${start}-${end}`;
}
