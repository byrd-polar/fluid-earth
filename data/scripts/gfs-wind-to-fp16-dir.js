#!/bin/env node
// Apply the gfs-wind-to-fp16.js script to all files in two directories, and
// name the outputs as ISO 8601 dates corresponding to the input file name
// format. Assumes both directories have files for the same dates.
//
// Example of input file format: gfs.0p25.2020080500.f000.grib2(+ more chars)
//
// Usage node gfs-wind-to-fp16-dir.js [uDir] [vDir] [outputDir]

import { execFile } from 'child_process';
import { readdirSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (process.argv.length < 2 + 3) {
  console.log('wrong number of arguments, expected 3\n');
  console.log('Usage node gfs-wind-to-fp16-dir.js [uDir] [vDir]');
  process.exit(1);
}

const inputDir1 = process.argv[2];
const inputDir2 = process.argv[3];
const outputDir = process.argv[4];

const dir1 = readdirSync(inputDir1).filter(f => !f.includes('.fp16')).sort();
const dir2 = readdirSync(inputDir2).filter(f => !f.includes('.fp16')).sort();

for (let i = 0; i < dir1.length; i++) {
  const inputFile1 = dir1[i];
  const inputFile2 = dir2[i];

  const year = inputFile1.slice(9, 13);
  const month = inputFile1.slice(13, 15);
  const day = inputFile1.slice(15, 17);
  const hour = inputFile1.slice(17, 19);

  const date = new Date(Date.UTC(year, month - 1, day, hour));
  const outputFile = date.toISOString() + '.fp16';

  execFile(
    join(__dirname, 'gfs-wind-to-fp16.js'),
    [
      join(inputDir1, inputFile1),
      join(inputDir2, inputFile2),
      join(outputDir, outputFile)
    ],
    () => { console.log(`${inputFile1}, ${inputFile2} => ${outputFile}`) },
  );
}
