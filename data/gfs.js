import { download, OUTPUT_DIR } from './index.js';
import { spawnSync } from 'child_process';
import path from 'path';

// if the below URL breaks, generate a new one from
//
// https://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_0p25.pl
//
// (will have to change the date)
const url = `https://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_0p25.pl?\
file=gfs.t12z.pgrb2.0p25.f000&\
lev_surface=on&\
var_TMP=on&\
dir=%2Fgfs.20200811%2F12`

export async function gfs() {
  let file = await download(url);
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
