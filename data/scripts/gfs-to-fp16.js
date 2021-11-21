#!/bin/env node
// Convert a GFS file to fp16
//
// Usage: node gfs-to-fp16.js <inputFile> <outputFile> [<factor>]

import { Float16Array } from '@petamoriken/float16';
import { spawn } from 'child_process';
import { Transform } from 'stream';
import { createWriteStream } from 'fs';
import { compress } from './utility.js';
import { platform } from 'os';

if (process.argv.length != 2 + 2 && process.argv.length != 2 + 3) {
  console.log('wrong number of arguments, expected 2-3\n');
  console.log(
    'Usage: node gfs-to-fp16.js <inputFile> <outputFile> [<factor>]'
  );
  process.exit(1);
}

const inputFile = process.argv[2];
const outputFile = process.argv[3];
const factor = process.argv[4];

const wgrib2 = spawn('wgrib2', [
  inputFile,
  '-inv', platform() === 'win32' ? 'NUL' : '/dev/null',
  '-bin', '-',
  '-no_header',
  '-order', 'we:sn'
]);

const float16 = new Transform({
  transform(chunk, _encoding, callback) {
    const original = new Float32Array(chunk.buffer);

    // replace magic value for "missing" with -Infinity (to represent NaN, as
    // GLSL doesn't always support NaN)
    let filtered = original.map(v => v > 9.9989e20 ? -Infinity : v);

    // allows for division of values too large to fit in 16-bit floats
    if (factor) filtered = filtered.map(v => v / factor);

    const converted = new Float16Array(filtered);
    callback(null, Buffer.from(converted.buffer));
  }
});

const output = createWriteStream(outputFile);

wgrib2.stdout.pipe(float16).pipe(compress).pipe(output);

wgrib2.stderr.pipe(process.stderr);
wgrib2.on('exit', code => { if (code !== 0) process.exit(code) });
