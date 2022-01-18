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

async function grib2_to_arr(input) {
  return new Promise((resolve, reject) => {
    let child = spawn('wgrib2', [
      '-',
      '-inv', platform() === 'win32' ? 'NUL' : '/dev/null',
      '-bin', '-',
      '-no_header',
      '-order', 'we:sn'
    ], { stdio: [input, 'pipe', 'pipe'] });

    let { stdout, stderr } = child;
    let chunks = [];
    let errs = [];

    stdout.on('data', chunk => chunks.push(chunk));
    stderr.on('data', err => errs.push(err));

    child.on('close', code => {
      if (code === 0) {
        resolve(new Float32Array(Buffer.concat(chunks).buffer));
      } else {
        let msg = Buffer.concat(errs).toString();
        reject(`wgrib2 exited with code ${code}:\n${msg}`);
      };
    });

    for (let obj of [child, input, stdout, stderr]) {
      obj.on('error', reject);
    }
  });
}

function is_magic_NaN(val) {
  return val > 9.9989e20;
}

function float32_array_to_float16_buffer(arr, transform) {
  return Buffer.from(new Float16Array(arr.map(transform)).buffer);
}
