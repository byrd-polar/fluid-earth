#!/bin/env node
// Convert one variable of a NETCDF file to fp16
//
// Usage: node netcdf-to-fp16.js <inputFile> <outputFile> <variable> [<factor>]

import { Float16Array } from '@petamoriken/float16';
import { spawn } from 'child_process';
import { Transform } from 'stream';
import { createWriteStream } from 'fs';
import { compress } from './utility.js';
import { platform } from 'os';
import split2 from 'split2';

if (process.argv.length != 2 + 3 && process.argv.length != 2 + 4) {
  console.log('wrong number of arguments, expected 3-4\n');
  console.log(
    'Usage: node netcdf-to-fp16.js <inputFile> <outputFile> <variable> [<factor>]'
  );
  process.exit(1);
}

const inputFile = process.argv[2].replace(/\\/g, '/');
const outputFile = process.argv[3];
const variable = process.argv[4];
const factor = process.argv[5];

const netcdf = spawn('ncdump', ['-v', variable, '-p', '9,17', inputFile]);

let inHeader = true;

const float16 = new Transform({
  transform(chunk, _encoding, callback) {
    const chunkAsString = chunk.toString();

    if (inHeader) {
      inHeader = chunkAsString !== ` ${variable} =`;
      callback(null, Buffer.alloc(0));
      return;
    }

    let original = chunkAsString.split(/[,;]/).slice(0, -1).map(x => parseFloat(x));

    // allows for multiplication of values too small for 16-bit floats
    if (factor) original = original.map(v => v * factor);

    const converted = new Float16Array(original);
    callback(null, Buffer.from(converted.buffer));
  }
});

const output = createWriteStream(outputFile);

netcdf.stdout.pipe(split2()).pipe(float16).pipe(compress).pipe(output);

netcdf.stderr.pipe(process.stderr);
netcdf.on('exit', code => { if (code !== 0) process.exit(code) });
