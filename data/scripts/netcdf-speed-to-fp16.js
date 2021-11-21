#!/bin/env node
// Convert a NETCDF file with u and v variables to fp16
//
// Usage: node netcdf-speed-to-fp16.js <inputFile> <outputFile>

import { Float16Array } from '@petamoriken/float16';
import { spawn } from 'child_process';
import { writeCompressedFile } from './utility.js';
import split2 from 'split2';

if (process.argv.length != 2 + 2) {
  console.log('wrong number of arguments, expected 2\n');
  console.log(
    'Usage: node netcdf-speed-to-fp16.js <inputFile> <outputFile>'
  );
  process.exit(1);
}

const inputFile = process.argv[2];
const outputFile = process.argv[3];

async function getArr(inputFile, variable) {
  const netcdf = spawn('ncdump', ['-v', variable, '-p', '9,17', inputFile]);

  const values = [];
  let inHeader = true;

  netcdf.stderr.pipe(process.stderr);
  netcdf.on('exit', code => { if (code !== 0) process.exit(code) });

  for await (const chunk of netcdf.stdout.pipe(split2())) {
    const chunkAsString = chunk.toString();

    if (inHeader) {
      inHeader = chunkAsString !== ` ${variable} =`;
      continue;
    }

    const chunkAsFloats =
      chunkAsString.split(/[,;]/).slice(0, -1).map(x => parseFloat(x));
    values.push(...chunkAsFloats);
  }
  return values;
}

const [arrU, arrV] =
  await Promise.all(['u', 'v'].map(v => getArr(inputFile, v)));
const data = new Float16Array(arrU.length);

for (let i = 0; i < data.length; i++) {
  // replace NaNs with -Infinity (as GLSL doesn't always support NaN)
  let val = Math.hypot(arrU[i], arrV[i]);
  data[i] = isNaN(val) ? -Infinity : val;
}

await writeCompressedFile(outputFile, Buffer.from(data.buffer));
