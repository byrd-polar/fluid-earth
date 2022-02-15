import { createWriteStream } from 'fs';
import {
  mkdir,
  mkdtemp,
  open,
  rename,
  rm,
  rmdir,
  writeFile,
} from 'fs/promises';
import { join, dirname, basename } from 'path';
import { pipeline } from 'stream/promises';
import { setTimeout as sleep } from 'timers/promises';
import { fileURLToPath } from 'url';

let parent_tmp_dir = join(dirname(fileURLToPath(import.meta.url)), 'atomic');
await mkdir(parent_tmp_dir, { recursive: true });

export async function write_file_atomically(file, data) {
  await write_atomically(file, data);
}

export async function stream_to_file(stream, file) {
  await write_atomically(file, stream, true);
}

async function write_atomically(file, data, data_is_stream=false) {
  let tmp_dir = await mkdtemp(parent_tmp_dir);
  let tmp_file = join(tmp_dir, basename(file));

  if (data_is_stream) {
    await pipeline(data, createWriteStream(tmp_file));
  } else {
    await writeFile(tmp_file, data);
  }
  await rename(tmp_file, file);
  await rmdir(tmp_dir);
}

export async function lock_file(file) {
  let lock = get_lockfile(file);
  let backoff = 100;

  while (true) {
    try {
      await open(lock, 'wx');
      break;

    } catch {
      if (backoff > 5_000) throw `Getting lock on ${file} timed out`;

      await sleep(backoff);
      backoff += 100;
    }
  }
}

export async function unlock_file(file) {
  await rm(get_lockfile(file));
}

function get_lockfile(file) {
  return `${file}.lock`;
}
