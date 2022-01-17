import { Float16Array } from '@petamoriken/float16';
import { Buffer } from 'buffer';
import { spawn } from 'child_process';
import { writeFile } from 'fs/promises';
import { platform } from 'os';

export async function gfs_grib(input, output, factor=1) {
  await writeFile(output, float32_array_to_float16_buffer(
    await grib2_to_arr(input),
    v => is_magic_NaN(v) ? -Infinity : v,
  ));
}

export async function gfs_acc_grib(inputA, inputB, output) {
  let [arrA, arrB] = await Promise.all([inputA, inputB].map(grib2_to_arr));

  await writeFile(output, float32_array_to_float16_buffer(arrA, (a, i) => {
    let b = arrB[i];
    a = is_magic_NaN(a) ? NaN : a;
    b = is_magic_NaN(b) ? NaN : b;
    let v = b - a;
    return isNaN(v) ? -Infinity : v;
  }));
}

async function grib2_to_arr(path) {
  return new Promise((resolve, reject) => {
    let child = spawn('wgrib2', [
      path,
      '-inv', platform() === 'win32' ? 'NUL' : '/dev/null',
      '-bin', '-',
      '-no_header',
      '-order', 'we:sn'
    ]).on('error', reject);

    let { stdout, stderr } = child;
    let chunks = [];

    stdout.on('data', chunk => chunks.push(chunk));

    child.on('close', code => {
      if (code !== 0) {
        reject(`wgrib2 exited with code ${code}`)
      } else {
        resolve(new Float32Array(Buffer.concat(chunks).buffer));
      };
    });
  });
}

function is_magic_NaN(val) {
  return val > 9.9989e20;
}

function float32_array_to_float16_buffer(arr, transform) {
  return Buffer.from(new Float16Array(arr.map(transform)).buffer);
}
