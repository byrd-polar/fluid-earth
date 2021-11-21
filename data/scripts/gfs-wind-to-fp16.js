#!/bin/env node
// Calculate wind speed from GFS files and convert to fp16
//
// Usage: node gfs-wind-to-fp16.js <uWind> <vWind> <outputFile>

import { Float16Array } from '@petamoriken/float16';
import { spawn } from 'child_process';
import { Readable, Transform } from 'stream';
import { createReadStream, createWriteStream } from 'fs';
import { compress } from './utility.js';
import { platform } from 'os';

if (process.argv.length != 2 + 3) {
  console.log('wrong number of arguments, expected 3\n');
  console.log('Usage: node gfs-to-fp16.js <uWind> <vWind> <outputFile>');
  process.exit(1);
}

const uWind = process.argv[2];
const vWind = process.argv[3];
const outputFile = process.argv[4];

const cat = Readable.from((async function*(streams) {
  for (const stream of streams) {
    for await (const chunk of stream) {
      yield chunk;
    }
  }
})([uWind, vWind].map(f => createReadStream(f))));

const wind = spawn('wgrib2', [
  '-',
  '-inv', platform() === 'win32' ? 'NUL' : '/dev/null',
  '-wind_speed', '-',
]);

const wgrib2 = spawn('wgrib2', [
  '-',
  '-inv', platform() === 'win32' ? 'NUL' : '/dev/null',
  '-bin', '-',
  '-no_header',
  '-order', 'we:sn'
]);

const float16 = new Transform({
  transform(chunk, _encoding, callback) {
    const original = new Float32Array(chunk.buffer);
    const converted = new Float16Array(original);
    callback(null, Buffer.from(converted.buffer)); 
  }
});

const output = createWriteStream(outputFile);

cat.pipe(wind.stdin);
wind.stdout.pipe(wgrib2.stdin)
wgrib2.stdout.pipe(float16).pipe(compress).pipe(output);

wind.stderr.pipe(process.stderr);
wgrib2.stderr.pipe(process.stderr);
wind.on('exit', code => { if (code !== 0) process.exit(code) });
wgrib2.on('exit', code => { if (code !== 0) process.exit(code) });
