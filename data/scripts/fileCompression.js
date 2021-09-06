import { writeFile } from 'fs/promises';
import { hostname } from 'os';
import { promisify } from 'util';
import {
  createBrotliCompress,
  brotliCompress as _brotliCompress,
  createGzip,
  gzip as _gzip,
} from 'zlib';
const brotliCompress = promisify(_brotliCompress);
const gzip = promisify(_gzip);

export const useBrotli =
  hostname() === 'fever.byrd.osu.edu' ||
  process.env.FEV2R_USE_BROTLI === 'true';

export const compress = useBrotli ? createBrotliCompress() : createGzip();

// wrapper for fs/promises#writeFile
export async function writeCompressedFile(outputFile, buffer) {
  let compressFn = useBrotli ? brotliCompress : gzip;
  await writeFile(outputFile, await compressFn(buffer));
}
