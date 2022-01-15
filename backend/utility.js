import { createWriteStream } from 'fs';
import {
  mkdtemp,
  open,
  rename,
  rm,
  rmdir,
  writeFile,
} from 'fs/promises';
import { get } from 'https';
import { tmpdir } from 'os';
import { basename, join } from 'path';
import { pipeline } from 'stream';
import { setTimeout as sleep } from 'timers/promises';

export async function atomicWriteFile(file, data) {
  let tmpDir = await createTempDir();
  let tmpFile = join(tmpDir, basename(file));

  await writeFile(tmpFile, data);
  await rename(tmpFile, file);
  await rmdir(tmpDir);
}

export async function createTempDir() {
  return await mkdtemp(join(tmpdir(), 'fev2r-'));
}

export async function lockFile(file) {
  let lock = getLockfile(file);
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

export async function unlockFile(file) {
  await rm(getLockfile(file));
}

function getLockfile(file) {
  return `${file}.lock`;
}

export async function download(url, file, options={}) {
  await new Promise((resolve, reject) => {
    get(url, options, response => {
      let { statusCode, statusMessage } = response;
      if (statusCode !== 200) {
        response.resume();
        reject(`Download failed with status ${statusCode} ${statusMessage}`);
        return;
      }
      pipeline(
        response,
        createWriteStream(file),
        err => err ? reject(err) : resolve(),
      );
    }).on('error', reject);
  });
}
