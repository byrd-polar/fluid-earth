import {
  mkdtemp,
  open,
  rename,
  rm,
  rmdir,
  writeFile,
} from 'fs/promises';
import { tmpdir } from 'os';
import { basename, join } from 'path';
import { setTimeout as sleep } from 'timers/promises';

export async function write_file_atomically(file, data_or_stream) {
  let tmp_dir = await create_temp_dir();
  let tmp_file = join(tmp_dir, basename(file));

  await writeFile(tmp_file, data);
  await rename(tmp_file, file);
  await rmdir(tmp_dir);
}

export async function create_temp_dir() {
  return await mkdtemp(join(tmpdir(), 'fev2r-'));
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
