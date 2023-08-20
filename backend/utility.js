import { Datetime } from './datetime.js';
import { createHash } from 'crypto';
import { rmSync } from 'fs';
import {
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rename,
  rmdir,
  stat,
  writeFile,
} from 'fs/promises';
import { platform, tmpdir } from 'os';
import { resolve, join, dirname, sep, basename } from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import { brotliCompress as _brotliCompress, constants } from 'zlib';
const brotliCompress = promisify(_brotliCompress);

export const parent_output_dir = await create_dir('../public/tera');
export const sources_state_dir = await create_dir('./state/sources');
export const datasets_state_dir = await create_dir('./state/datasets');
export const perm_cache_dir = await create_dir('./cache');
const temp_cache_dir = await create_dir(join(tmpdir(), 'fev2r-cache'));

const possible_temp_files = [];

process.on('uncaughtExceptionMonitor', () => {
  for (let file of possible_temp_files) rmSync(file, { force: true });
});

async function create_dir(relative_path) {
  let path = absolute_path(relative_path);
  await mkdir_p(path);
  return path;
}

export function get_temp_file(filename=undefined) {
  let path = join(temp_cache_dir, filename ?? uuidv4());
  possible_temp_files.push(path);
  return path;
}

export function absolute_path(relative_path) {
  return resolve(dirname(fileURLToPath(import.meta.url)), relative_path);
}

export async function hash_of_this_file(import_meta) {
  let data = await readFile(fileURLToPath(import_meta.url));
  return createHash('md5').update(data).digest('hex');
}

export async function mkdir_p(path) {
  await mkdir(path, { mode: '775', recursive: true });
}

export async function json_dir_to_obj(path) {
  if (!(await stat(path)).isDirectory()) return read_json(path);

  return Object.fromEntries(await Promise.all(
    (await readdir(path)).map(async file => [
      basename(file, '.json'),
      await json_dir_to_obj(join(path, file)),
    ])
  ));
}

export async function read_json(file, default_value=undefined) {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch (e) {
    if (default_value !== undefined && e.code === 'ENOENT') {
      return default_value;
    }
    throw e;
  }
}

export async function write_json_atomically(file, obj, compress=false) {
  let string = JSON.stringify(obj, null, compress ? null : 2);
  let data = compress ? await brotli(string) : string;

  await write_file_atomically(file, data);
}

const parent_tmp_dir = await create_dir('./atomic');

export async function write_file_atomically(file, data) {
  let tmp_dir = await mkdtemp(parent_tmp_dir + sep);
  let tmp_file = join(tmp_dir, basename(file));

  await writeFile(tmp_file, data);
  await rename(tmp_file, file);
  await rmdir(tmp_dir);
}

export async function brotli(buffer, compression_level=11) {
  let params = { [constants.BROTLI_PARAM_QUALITY]: compression_level };
  return brotliCompress(buffer, { params });
}

const tp_size = process.env.UV_THREADPOOL_SIZE ?? 4;

export async function run_all(promise_functions, max_concurrency=tp_size) {
  return new Promise((resolve, reject) => {
    let finished_count = -max_concurrency;
    let queue = [...promise_functions];
    let rejected = false;
    let reject_and_stop = e => { reject(e); rejected = true };
    let tick = () => {
      if (rejected) return;
      if (++finished_count === promise_functions.length) resolve();
      if (queue.length > 0) queue.shift()().then(tick, reject_and_stop);
    };
    for (let i = 0; i < max_concurrency; i++) tick();
  });
}

const windows = platform() === 'win32';

export function output_path(output_dir, iso_date_string) {
  if (windows) iso_date_string = iso_date_string.replaceAll(':', '_');
  return join(output_dir, `${iso_date_string}.fp16.br`);
}

export function typical_metadata(dataset, dt, shared_metadata) {
  let { start, end, missing } = dataset.current_state;
  start ??= dt.to_iso_string();
  end = !end || dt > Datetime.from(end) ? dt.to_iso_string() : end;
  let metadata = dataset.metadata ?? {};
  let new_state = { start, end, missing };
  return { start, end, missing, ...metadata, ...shared_metadata, new_state };
}
