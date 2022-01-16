import { Float16Array } from '@petamoriken/float16';
import { Buffer } from 'buffer';
import { spawn } from 'child_process';
import { createWriteStream } from 'fs';
import { writeFile } from 'fs/promises';
import { platform } from 'os';
import { Duplex, pipeline } from 'stream';

export async function gfs_grib(input, output, factor=1) {
  await new Promise((resolve, reject) => {
    pipeline(
      gfs_wgrib2(input, reject),
      async function*(source) {
        for await(const chunk of source) {
          yield float16_buffer(new Float32Array(chunk.buffer).map(v => {
            return is_magic_NaN(v) ? -Infinity : v * factor;
          }));
        }
      },
      createWriteStream(output),
      err => err ? reject(err) : resolve(),
    );
  });
}

export async function gfs_acc_grib(inputA, inputB, output) {
  let [arrA, arrB] = await Promise.all([inputA, inputB].map(input => {
    return get_values_array(input);
  }));
  await writeFile(output, float16_buffer(arrA.map((a, i) => {
    let b = arrB[i];
    a = is_magic_NaN(a) ? NaN : a;
    b = is_magic_NaN(b) ? NaN : b;
    let v = b - a;
    return isNaN(v) ? -Infinity : v;
  })));
}

async function get_values_array(path) {
  return new Promise(async (resolve, reject) => {
    let stdout = gfs_wgrib2(path, reject);
    let buffers = [];
    for await(const chunk of stdout) {
      buffers.push(chunk);
    }
    resolve(new Float32Array(Buffer.concat(buffers).buffer));
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

function is_magic_NaN(val) {
  return val > 9.9989e20;
}

function float16_buffer(float32Array) {
  return Buffer.from(new Float16Array(float32Array).buffer);
}
