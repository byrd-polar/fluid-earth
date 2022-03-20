import { brotli, stream_from_file, write_file_atomically } from './utility.js';
import { Float16Array } from '@petamoriken/float16';
import { Buffer } from 'buffer';
import { spawn } from 'child_process';
import { platform } from 'os';

export async function grib2(input, output, options={}) {
  let arr = await grib2_to_arr(input, options.match);
  let array = arr.map(v => nan_for_glsl(is_magic_nan, v, options.factor));

  await write_array_to_file(output, array, options.compression_level);
}

export async function grib2_speed(input, output, options={}) {
  await gfs_combine_grib(input, output, options, Math.hypot);
}

export async function grib2_acc(input, output, options={}) {
  await gfs_combine_grib(input, output, options, (a, b) => b - a);
}

export async function netcdf(input, output, options={}) {
  let arr = await netcdf_to_arr(input, options.variables);
  let array = arr.map(v => nan_for_glsl(isNaN, v, options.factor));

  await write_array_to_file(output, array, options.compression_level);
}

export async function netcdf_speed(input, output, options={}) {
  let [arrA, arrB] = await netcdf_to_arr(input, options.variables, false);

  let array = arrA.map((a, i) => {
    let v = Math.hypot(a, arrB[i]);
    return nan_for_glsl(isNaN, v, options.factor);
  });

  await write_array_to_file(output, array, options.compression_level);
}

async function gfs_combine_grib(input, output, options, combine_fn) {
  let arr = await grib2_to_arr(input, options.match);

  let array = Array.from({ length: arr.length / 2 }, (_, i) => {
    let a = arr[i];
    let b = arr[i + arr.length / 2];
    a = is_magic_nan(a) ? NaN : a;
    b = is_magic_nan(b) ? NaN : b;
    return nan_for_glsl(isNaN, combine_fn(a, b), options.factor);
  });

  await write_array_to_file(output, array, options.compression_level);
}

const devnull = platform() === 'win32' ? 'NUL' : '/dev/null';

async function grib2_to_arr(input, match='.*') {
  if (typeof input === 'string') {
    input = await stream_from_file(input);
  }
  return spawn_cmd(
    'wgrib2',
    [
      '-',
      '-match', match,
      '-inv', devnull,
      '-bin', '-',
      '-no_header',
      '-order', 'we:sn',
      '-ncpu', '1',
    ],
    { stdio: [input, 'pipe', 'pipe'] },
    [input],
    (buf, resolve) => {
      resolve(new Float32Array(buf.buffer, buf.byteOffset, buf.length / 4));
    },
  );
}

async function netcdf_to_arr(input, variables, flatten=true) {
  return spawn_cmd(
    'ncdump',
    ['-v', variables, '-p', '9,17', input],
    {},
    [],
    (buffer, resolve) => {
      let string = buffer.toString();
      let arrays = variables.split(',').map(v => {
        return string
          .match(new RegExp(` ${v} =\n(.*?);`, 's'))[1]
          .split(',')
          .map(x => parseFloat(x));
      });
      resolve(flatten ? [].concat(...arrays) : arrays);
    },
  );
}

async function spawn_cmd(command, args, options, rejects, process_data_fn) {
  return new Promise((resolve, reject) => {
    let child = spawn(command, args, options);

    let { stdout, stderr } = child;
    let chunks = [];
    let errs = [];

    stdout.on('data', chunk => chunks.push(chunk));
    stderr.on('data', err => errs.push(err));

    child.on('close', code => {
      if (code === 0) {
        process_data_fn(Buffer.concat(chunks), resolve);
      } else {
        let msg = Buffer.concat(errs).toString();
        reject(`${command} exited with code ${code}:\n${msg}`);
      };
    });

    for (let obj of [child, stdout, stderr, ...rejects]) {
      obj.on('error', reject);
    }
  });
}

function is_magic_nan(val) {
  return val > 9.9989e20;
}

function nan_for_glsl(is_nan_fn, val, factor=1) {
  return is_nan_fn(val) ? -Infinity : val * factor;
}

async function write_array_to_file(output, array, compression_level=11) {
  let buffer = Buffer.from(new Float16Array(array).buffer);
  let compressed_buffer = await brotli(buffer, compression_level);

  await write_file_atomically(output, compressed_buffer);
}
