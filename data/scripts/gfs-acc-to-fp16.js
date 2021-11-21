#!/bin/env node
// Convert two GFS files for accumulated variables to fp16 (hourly accumulation)
//
// E.g. 0-8 hour acc fcst and 0-9 hour acc fcst as inputs to 8-9 hour acc fcst

import { Float16Array } from '@petamoriken/float16';
import { spawn } from 'child_process';
import { writeCompressedFile } from './utility.js';
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

async function getArr(inputFile) {
  const wgrib2 = spawn('wgrib2', [
    inputFile,
    '-inv', platform() === 'win32' ? 'NUL' : '/dev/null',
    '-bin', '-',
    '-no_header',
    '-order', 'we:sn'
  ]);
  wgrib2.stderr.pipe(process.stderr);
  wgrib2.on('exit', code => { if (code !== 0) process.exit(code) });

  const buffers = [];

  for await (const chunk of wgrib2.stdout) buffers.push(chunk);

  return new Float32Array(Buffer.concat(buffers).buffer)
}

const [arrA, arrB] = await Promise.all([inputFileA, inputFileB].map(getArr));
const data = new Float16Array(arrA.length);

for (let i = 0; i < data.length; i++) {
  // replace magic value for "missing" with -Infinity (to represent NaN, as
  // GLSL doesn't always support NaN)
  let valA = arrA[i] > 9.9989e20 ? NaN : arrA[i];
  let valB = arrB[i] > 9.9989e20 ? NaN : arrB[i];
  data[i] = isNaN(valB - valA) ? -Infinity : valB - valA;
}

await writeCompressedFile(outputFile, Buffer.from(data.buffer));
