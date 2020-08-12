import { download, OUTPUT_DIR, exit } from './index.js';
import { spawnSync } from 'child_process';
import path from 'path';
import { readFile } from 'fs/promises';

import { promisify } from 'util';

import _parseCSV from 'csv-parse';
const parseCSV = promisify(_parseCSV);

// from https://nomads.ncep.noaa.gov/pub/data/nccf/com/gfs/prod/
const dataURL = `https://nomads.ncep.noaa.gov/pub/data/nccf/com/gfs/prod/\
gfs.20200812/06/gfs.t06z.pgrb2.0p25.f000`
const indexURL = dataURL + '.idx';

export async function gfs() {
  // file containing information for partial downloads
  let indexFile = await download(indexURL);
  let indexString = await readFile(indexFile, 'utf-8');
  let index = await parseCSV(indexString, { delimiter: ':' });

  await saveGFS(dataURL, index, 'TMP', 'surface', 'gfs-temperature.f32');
  await saveGFS(dataURL, index, 'UGRD', '10 m above ground', 'gfs-u-wind.f32');
  await saveGFS(dataURL, index, 'VGRD', '10 m above ground', 'gfs-v-wind.f32');
}

// converts part of a Grib file from GFS to f32 format
async function saveGFS(url, index, parameter, level, filename) {
  let file = await download(url, true, `_${parameter}_${level}`, {
    Range: getRange(index, parameter, level),
  });
  let outputFile = path.join(OUTPUT_DIR, filename);

  console.log(`Generating GFS data...\n${file}\n=> ${outputFile}\n`);
  let wgrib2 = spawnSync(
    'wgrib2',
    [file, '-bin', outputFile, '-no_header', '-order', 'raw' ]
  );

  if (wgrib2.status !== 0) {
    console.log(
      `Could not run wgrib2, skipping...\n=> ${wgrib2.stderr.toString()}\n`
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
