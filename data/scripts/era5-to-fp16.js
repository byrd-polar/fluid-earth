#!/bin/env node
// Convert a ERA5 (grib1) file to fp16
//
// Usage: node era5-to-fp16.js <inputFile> <outputFile>

import { Float16Array } from '@petamoriken/float16';
import { spawn } from 'child_process';
import { Transform } from 'stream';
import { createReadStream, createWriteStream } from 'fs';
import { mkdtemp, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

if (process.argv.length != 2 + 2) {
  console.log('wrong number of arguments, expected 2\n');
  console.log(
    'Usage: node era5-to-fp16.js <inputFile> <outputFile>'
  );
  process.exit(1);
}

const inputFile = process.argv[2];
const outputFile = process.argv[3];

const tmpDir = await mkdtemp(join(tmpdir(), 'era5-to-fp16-'));
const tmpFile = join(tmpDir, 'wgrib-dump');

const wgrib = spawn('wgrib', [
  inputFile,
  '-d', 1,
  '-bin',
  '-nh',
  '-o', tmpFile,
]);

wgrib.stderr.pipe(process.stderr);
wgrib.on('exit', code => code === 0 ? convert(tmpFile) : process.exit(code));

const float16 = new Transform({
  transform(chunk, _encoding, callback) {
    const original = new Float32Array(chunk.buffer);

    // replace magic value for "missing" with -Infinity (to represent NaN, as
    // GLSL doesn't always support NaN)
    let filtered = original.map(v => v > 9.9989e20 ? -Infinity : v);

    const converted = new Float16Array(filtered);
    callback(null, Buffer.from(converted.buffer));
  }
});

function convert(tmpFile) {
  const tmp = createReadStream(tmpFile);
  const output = createWriteStream(outputFile);
  tmp.pipe(float16).pipe(output)
    .on('close', () => rm(tmpDir, {recursive: true}));
}
