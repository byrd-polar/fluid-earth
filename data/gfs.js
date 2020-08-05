import { download, exit, OUTPUT_DIR } from './index.js';
import { spawnSync } from 'child_process';
import { writeFileSync } from 'fs';
import path from 'path';

// if the below URL breaks, generate a new one from
//
// https://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_0p25.pl
//
// (will have to change the date)
const url = `https://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_0p25.pl?\
file=gfs.t18z.pgrb2.0p25.f000&\
lev_surface=on&\
var_TMP=on&\
dir=%2Fgfs.20200804%2F18`

export async function gfs() {
  let file = await download(url);
  let outputFile = path.join(OUTPUT_DIR, 'gfs.f32');

  console.log(`Generating GFS data...\n${file}\n=> ${outputFile}\n`);

  let grib_dump = spawnSync('grib_dump', ['-j', '-p', 'values', file], {
    maxBuffer: Infinity, // default is 1024 * 1024, which is not enough
  });

  if (grib_dump.error) {
    console.log(`Could not run grib_dump, skipping...\n=> ${grib_dump.error}\n`);
    return;
  }

  let json = JSON.parse(grib_dump.stdout); 
  let data = Float32Array.from(json.value);
 
  writeFileSync(outputFile, data);
}
