import { writeFile } from 'fs/promises';
import { promisify } from 'util';
import { createBrotliCompress, brotliCompress as _brotliCompress } from 'zlib';
const brotliCompress = promisify(_brotliCompress);

export const compress = createBrotliCompress();

// wrapper for fs/promises#writeFile
export async function writeCompressedFile(outputFile, buffer) {
  return await writeFile(outputFile, await brotliCompress(buffer));
}
