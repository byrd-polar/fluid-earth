import {
  mkdtemp,
  open,
  rename,
  rm,
  rmdir,
  writeFile,
} from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

export async function atomicWriteFile(file, data) {
  let tmpDir = await createTempDir();
  let tmpFile = join(tmpDir, file);

  await writeFile(tmpFile, data);
  await rename(tmpFile, file);
  await rmdir(tmpDir);
}

export async function createTempDir() {
  return await mkdtemp(join(tmpdir(), 'fev2r'));
}

export async function lockFile(file) {
  let lock = getLockfile(file);
  let backoff = 100;

  while (true) {
    try {
      await open(lock, 'wx');

    } catch {
      if (backoff > 5_000) throw `Getting lock on ${file} timed out`;

      await new Promise(r => setTimeout(r, backoff));
      backoff += 100;
      continue;
    }
    break;
  }
}

export async function unlockFile(file) {
  await rm(getLockfile(file));
}

function getLockfile(file) {
  return `${file}.lock`;
}
