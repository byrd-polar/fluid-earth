#!/bin/env node

// Migrate particle data files from old data directories to new one
//
// UV_THREADPOOL_SIZE=16 ./migrate.js /path/u/ /path/v/ /path/new/ --not-dry-run


import { brotli, run_all, write_file_atomically } from '../utility.js';
import { Buffer } from 'buffer';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

let [, , old_u_dir, old_v_dir, new_dir, flag] = process.argv;

let old_u_filenames = (await readdir(old_u_dir)).sort();
let old_v_filenames = (await readdir(old_v_dir)).sort();
let new_filenames = await readdir(new_dir);

if (!old_u_filenames.every((f, i) => f === old_v_filenames[i])) {
  throw 'u and v directories do not have same files';
}

let filenames = old_u_filenames
  .filter(f => f.endsWith('.fp16') && !new_filenames.includes(f + '.br'));

await run_all(filenames.map(filename => async () => {
  let u_input = join(old_u_dir, filename);
  let v_input = join(old_v_dir, filename);
  let output = join(new_dir, filename + '.br');

  console.log(`${u_input} + ${v_input} => ${output}`);

  if (flag === '--not-dry-run') {
    let old_data = Buffer.concat([
      await readFile(u_input),
      await readFile(v_input),
    ]);
    let new_data = await brotli(old_data);

    await write_file_atomically(output, new_data);
  }
}));
