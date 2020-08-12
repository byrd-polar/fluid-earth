import { download, OUTPUT_DIR } from './index.js';
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

  let tmpRange = getRange(index, 'TMP', 'surface');

  let file = await download(dataURL, true, '_surface_tmp', { Range: tmpRange });
  let outputFile = path.join(OUTPUT_DIR, 'gfs.f32');

  console.log(`Generating GFS data...\n${file}\n=> ${outputFile}\n`);
  let wgrib2 = spawnSync(
    'wgrib2',
    [file, '-bin', outputFile, '-no_header', '-order', 'raw' ]
  );

  if (wgrib2.status !== 0) {
    console.log(
      `Could not run wgrib2, skipping...\n=> ${wgrib2.stderr.toString()}\n`
    );
    return;
  }
}

// print the parsed index file to make sense of this function
//
// returns the string needed for the HTTP Range Request header
function getRange(index, parameter, level) {
  let i = index.findIndex((row) => {
    return row[3] == parameter && row[4] == level;
  });
  let start = index[i][1];
  let end;
  if (index[i+1] === undefined) {
    end = '';
  } else {
    end = index[i+1][1] - 1;
  }
  return `bytes=${start}-${end}`;
}
