#!/bin/env node
// Convert two GFS files for accumulated variables to fp16 (hourly accumulation)
//
// E.g. 0-8 hour acc fcst and 0-9 hour acc fcst as inputs to 8-9 hour acc fcst

import { Float16Array } from '@petamoriken/float16';
import { spawn } from 'child_process';
import { writeFile } from 'fs/promises';
import { platform } from 'os';

if (process.argv.length != 2 + 3) {
  console.log('wrong number of arguments, expected 3\n');
  console.log(
    'Usage: node gfs-acc-to-fp16.js <inputFile> <inputFileLater> <outputFile>'
  );
  process.exit(1);
}

const inputFileA = process.argv[2];
const inputFileB = process.argv[3];
const outputFile = process.argv[4];

const args = [
  '-inv', platform() === 'win32' ? 'NUL' : '/dev/null',
  '-bin', '-',
  '-no_header',
  '-order', 'we:sn'
];

const wgrib2A = spawn('wgrib2', [inputFileA, ...args]);
const wgrib2B = spawn('wgrib2', [inputFileB, ...args]);

const buffersA = [];
const buffersB = [];

for await (const chunk of wgrib2A.stdout) buffersA.push(chunk);
for await (const chunk of wgrib2B.stdout) buffersB.push(chunk);

const arrA = new Float32Array(Buffer.concat(buffersA).buffer);
const arrB = new Float32Array(Buffer.concat(buffersB).buffer);

const data = new Float16Array(arrA.length);

for (let i = 0; i < data.length; i++) {
  // replace magic value for "missing" with -Infinity (to represent NaN, as
  // GLSL doesn't always support NaN)
  let valA = arrA[i] > 9.9989e20 ? NaN : arrA[i];
  let valB = arrB[i] > 9.9989e20 ? NaN : arrB[i];
  data[i] = isNaN(valB - valA) ? -Infinity : valB - valA;
}

await writeFile(outputFile, Buffer.from(data.buffer));
