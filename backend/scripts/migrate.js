#!/bin/env node

// Migrate data files from old data directory to new one
//
// UV_THREADPOOL_SIZE=16 ./migrate.js /path/to/old/ /path/to/new/ --not-dry-run


import { brotli, run_all, write_file_atomically } from '../utility.js';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

let [, , old_dir, new_dir, flag] = process.argv;

let old_filenames = await readdir(old_dir);
let new_filenames = await readdir(new_dir);

let filenames = old_filenames
  .filter(f => f.endsWith('.fp16') && !new_filenames.includes(f + '.br'));

await run_all(filenames.map(filename => async () => {
  let input = join(old_dir, filename);
  let output = join(new_dir, filename + '.br');

  console.log(`${input} => ${output}`);

  if (flag === '--not-dry-run') {
    let old_data = await readFile(input);
    let new_data = await brotli(old_data);

    await write_file_atomically(output, new_data);
  }
}));
