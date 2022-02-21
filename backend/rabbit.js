import {
  absolute_path,
  make_absolute_path,
  mkdir_p,
  write_file_atomically,
} from './utility.js';
import { readdir, readFile } from 'fs/promises';
import { basename, join, relative } from 'path';
import { parentPort } from 'worker_threads';

const datasets_dir = absolute_path('./datasets');
const parent_output_dir = await make_absolute_path('../public/data');

let source_path = process.argv[2];
let source = basename(source_path, '.js');

let {
  forage,
  minutes_of_sleep,
  minutes_of_sleep_if_failure,
  minutes_of_sleep_if_success,
} = await import(source_path);

parentPort?.postMessage(minutes_of_sleep_if_failure ?? minutes_of_sleep);

let dataset_files = await readdir(datasets_dir);
let datasets = (await Promise.all(dataset_files.map(async file => {
  let dataset = await import(join(datasets_dir, file));
  if (dataset.source !== source) return;

  let output_dir = join(parent_output_dir, basename(file, '.js'));
  await mkdir_p(output_dir);

  return { output_dir, ...dataset };
}))).filter(d => d !== undefined);

let { metadatas=[] } = await forage(datasets);

for (let [index, metadata] of metadatas.entries()) {
  let dataset = datasets[index];
  let output_dir = dataset.output_dir;

  metadata.name = dataset.name;
  metadata.path = `/${relative(absolute_path('../public'), output_dir)}/`;

  let metadata_file = join(output_dir, 'metadata.json');
  await write_file_atomically(metadata_file, JSON.stringify(metadata, null, 2));
}

parentPort?.postMessage(minutes_of_sleep_if_success ?? minutes_of_sleep);
