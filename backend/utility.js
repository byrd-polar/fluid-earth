import { createReadStream } from 'fs';
import {
  mkdir,
  mkdtemp,
  open,
  readFile,
  rename,
  rmdir,
  writeFile,
} from 'fs/promises';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const parent_tmp_dir = await make_absolute_path('./atomic');

export async function make_absolute_path(relative_path) {
  let path = absolute_path(relative_path);
  await mkdir_p(path);
  return path;
}

export function absolute_path(relative_path) {
  return join(dirname(fileURLToPath(import.meta.url)), relative_path);
}

export async function mkdir_p(path) {
  await mkdir(path, { mode: '775', recursive: true });
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

export async function write_json_atomically(file, obj) {
  await write_file_atomically(file, JSON.stringify(obj, null, 2));
}

export async function write_file_atomically(file, data) {
  let tmp_dir = await mkdtemp(parent_tmp_dir);
  let tmp_file = join(tmp_dir, basename(file));

  await writeFile(tmp_file, data);
  await rename(tmp_file, file);
  await rmdir(tmp_dir);
}

export async function stream_from_file(file) {
  return new Promise((resolve, reject) => {
    let stream = createReadStream(file);
    stream.on('open', () => resolve(stream));
    stream.on('error', reject);
  });
}

export async function run_all(promise_functions, max_concurrency=8) {
  return new Promise((resolve, reject) => {
    let finished_count = -max_concurrency;
    let queue = [...promise_functions];
    let rejected = false;
    let reject_and_stop = () => { reject(); rejected = true };
    let tick = () => {
      if (rejected) return;
      if (++finished_count === promise_functions.length) resolve();
      if (queue.length > 0) queue.shift()().then(tick, reject_and_stop);
    };
    for (let i = 0; i < max_concurrency; i++) tick();
  });
}
