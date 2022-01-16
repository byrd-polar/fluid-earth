import { Float16Array } from '@petamoriken/float16';
import { Buffer } from 'buffer';
import { createWriteStream } from 'fs';
import { platform } from 'os';
import { Duplex, pipeline } from 'stream';

export async function gfs_grib(input, output, factor=1) {
  await new Promise((resolve, reject) => {
    pipeline(
      gfs_wgrib2(input, reject),
      gfs_processing,
      multiply(factor),
      float32_to_float16,
      createWriteStream(output),
      err => err ? reject(err) : resolve(),
    );
  });
}

function gfs_wgrib2(path, reject) {
  return spawn('wgrib2', [
    path,
    '-inv', platform() === 'win32' ? 'NUL' : '/dev/null',
    '-bin', '-',
    '-no_header',
    '-order', 'we:sn'
  ])
  .on('error', reject)
  .on('exit', code => {
    if (code !== 0) reject(`wgrib2 exited with code ${code}`);
  })
  .stdout;
}

async function* gfs_processing(source) {
  for await(const chunk of source) {
    yield Buffer.from(
      new Float32Array(chunk.buffer)
      .map(v => v > 9.9989e20 ? -Infinity : v));
  }
}

async function* float32_to_float16(source) {
  for await(const chunk of source) {
    yield Buffer.from(
      Float16Array.from(
        new Float32Array(chunk.buffer)));
  }
}

function multiply(factor) {
  return async function*(source) {
    for await(const chunk of source) {
      yield Buffer.from(
        new Float32Array(chunk.buffer)
        .map(v => v * factor));
    }
  }
}

export async function gfs_acc_grib(inputA, inputB, output) {
  await new Promise((resolve, reject) => {
    let sourceA = get_source(inputA, reject);
    let sourceB = get_source(inputB, reject);

    pipeline(
      combine(sourceA, sourceB),
      float32_to_float16,
      createWriteStream(output),
      err => err ? reject(err) : resolve(),
    );
  });
}

function get_source(path, reject) {
  return gfs_wgrib2(input, reject)
    .on('error', reject)
    .pipe(Duplex.from(gfs_processing))
    .on('error', reject)
    .pipe(Duplex.from(get_singles))
    .on('error', reject);
}

async function* get_singles(source) {
  for await(const chunk of source) {
    for (const value of new Float32Array(chunk.buffer)) {
      yield value;
    }
  }
}

function combine(sourceA, sourceB) {
  return async function*() {
    let iterA = sourceA[Symbol.asyncIterator]();
    let iterB = sourceB[Symbol.asyncIterator]();

    let a = await iterA.next();
    let b = await iterB.next();

    while (!a.done && !b.done) {
      let val = b.value - a.value;
      yield isNaN(val) ? -Infinity : val;

      a = await iterA.next();
      b = await iterB.next();
    }
  }
}
