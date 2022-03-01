import { stream_from_file, write_file_atomically } from './utility.js';
import { Float16Array } from '@petamoriken/float16';
import { Buffer } from 'buffer';
import { spawn } from 'child_process';
import { platform } from 'os';
import { brotliCompress as _brotliCompress, constants } from 'zlib';
import { promisify } from 'util';
const brotliCompress = promisify(_brotliCompress);

export async function grib2(input, output, options={}) {
  await write_file_atomically(output, await array_to_data(
    await grib2_to_arr(input, options.match),
    v => nan_for_glsl(is_magic_nan, v, options.factor),
    options.compression_level,
  ));
}

export async function grib2_speed(input, output, options={}) {
  await gfs_combine_grib(input, output, options, Math.hypot);
}

export async function grib2_acc(input, output, options={}) {
  await gfs_combine_grib(input, output, options, (a, b) => b - a);
}

export async function netcdf(input, output, options={}) {
  await write_file_atomically(output, await array_to_data(
    await netcdf_to_arr(input, options.variables),
    v => nan_for_glsl(isNaN, v, options.factor),
    options.compression_level,
  ));
}

export async function netcdf_speed(input, output, options={}) {
  let [arrA, arrB] = await netcdf_to_arr(input, options.variables, false);

  await write_file_atomically(output, await array_to_data(arrA, (a, i) => {
    let v = Math.hypot(a, arrB[i]);
    return nan_for_glsl(isNaN, v, options.factor);
  }, options.compression_level));
}

async function gfs_combine_grib(input, output, options, combine_fn) {
  let arr = await grib2_to_arr(input, options.match);
  let arrA = new Float32Array(arr.buffer, 0, arr.length / 2);
  let arrB = new Float32Array(arr.buffer, 4 * arr.length / 2);

  await write_file_atomically(output, await array_to_data(arrA, (a, i) => {
    let b = arrB[i];
    a = is_magic_nan(a) ? NaN : a;
    b = is_magic_nan(b) ? NaN : b;
    return nan_for_glsl(isNaN, combine_fn(a, b), options.factor);
  }, options.compression_level));
}

const devnull = platform() === 'win32' ? 'NUL' : '/dev/null';

async function grib2_to_arr(input, match='.*') {
  if (typeof input === 'string') {
    input = await stream_from_file(input);
  }
  return await spawn_cmd(
    'wgrib2',
    [
      '-',
      '-match', match,
      '-inv', devnull,
      '-bin', '-',
      '-no_header',
      '-order', 'we:sn'
    ],
    { stdio: [input, 'pipe', 'pipe'] },
    [input],
    (buf, resolve) => {
      resolve(new Float32Array(buf.buffer, buf.byteOffset, buf.length / 4));
    },
  );
}

async function netcdf_to_arr(input, variables, flatten=true) {
  return await spawn_cmd(
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

async function array_to_data(arr, transform_fn, compression_level=6) {
  return await brotliCompress(
    Buffer.from(new Float16Array(arr.map(transform_fn)).buffer),
    { params: { [constants.BROTLI_PARAM_QUALITY]: compression_level } },
  );
}
