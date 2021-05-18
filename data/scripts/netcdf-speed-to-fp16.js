#!/bin/env node

import { Float16Array } from '@petamoriken/float16';
import { spawn } from 'child_process';
import { Transform } from 'stream';
import { writeFile } from 'fs/promises';
import { platform } from 'os';
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


let inHeader = true;


const netcdfU = spawn('ncdump', ['-v', 'u', inputFile]);
const buffersU = [];
inHeader = true;
for await (const chunk of netcdfU.stdout.pipe(split2())) {
  const chunkAsString = chunk.toString();
  if (inHeader) {
    inHeader = chunkAsString !== ` u =`;
    continue;
  }
  const chunkAsFloats = chunkAsString.split(/[,;]/).slice(0, -1).map(x => parseFloat(x));
  const converted = new Float32Array(chunkAsFloats);
  buffersU.push(Buffer.from(converted.buffer));
}
const arrU = new Float32Array(Buffer.concat(buffersU).buffer);

const netcdfV = spawn('ncdump', ['-v', 'v', inputFile]);
const buffersV = [];
inHeader = true;
for await (const chunk of netcdfV.stdout.pipe(split2())) {
  const chunkAsString = chunk.toString();
  if (inHeader) {
    inHeader = chunkAsString !== ` v =`;
    continue;
  }
  const chunkAsFloats = chunkAsString.split(/[,;]/).slice(0, -1).map(x => parseFloat(x));
  const converted = new Float32Array(chunkAsFloats);
  buffersV.push(Buffer.from(converted.buffer));
}
const arrV = new Float32Array(Buffer.concat(buffersV).buffer);


const data = new Float16Array(arrU.length);

for (let i = 0; i < data.length; i++) {
  // replace magic value for "missing" with -Infinity (to represent NaN, as
  // GLSL doesn't always support NaN)
  let valU = arrU[i] > 9.9989e20 ? NaN : arrU[i];
  let valV = arrV[i] > 9.9989e20 ? NaN : arrV[i];
  data[i] = isNaN(Math.hypot(valU, valV)) ? -Infinity : Math.hypot(valU, valV);
}

await writeFile(outputFile, Buffer.from(data.buffer));
