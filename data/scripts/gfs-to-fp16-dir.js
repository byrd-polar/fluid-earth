#!/bin/env node
// Apply the gfs-to-fp16.js script to all files in a directory, and name the
// outputs as ISO 8601 dates corresponding to the input file name format
//
// Example of input file format: gfs.0p25.2020080500.f000.grib2(+ more chars)
//
// Usage node gfs-to-fp16-dir.js [dir]

import { execFile } from 'child_process';
import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (process.argv.length < 2 + 1) {
  console.log('wrong number of arguments, expected 1\n');
  console.log('Usage node gfs-to-fp16-dir.js [dir]');
  process.exit(1);
}

const dir = process.argv[2];

for (const inputFile of readdirSync(dir).filter(f => !f.includes('.fp16')) {
  const year = inputFile.slice(9, 13);
  const month = inputFile.slice(13, 15);
  const day = inputFile.slice(15, 17);
  const hour = inputFile.slice(17, 19);

  const date = new Date(Date.UTC(year, month - 1, day, hour));
  const outputFile = date.toISOString() + '.fp16';

  execFile(
    join(__dirname, 'gfs-to-fp16.js'),
    [inputFile, outputFile],
    { cwd: dir },
    () => { console.log(`${inputFile} => ${outputFile}`) },
  );
}
