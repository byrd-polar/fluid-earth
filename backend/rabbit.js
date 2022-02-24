import {
  absolute_path,
  make_absolute_path,
  mkdir_p,
  read_json,
  write_json_atomically,
} from './utility.js';
import { readdir, readFile } from 'fs/promises';
import { basename, join, relative } from 'path';
import { parentPort } from 'worker_threads';

const datasets_dir = absolute_path('./datasets');
const parent_output_dir = await make_absolute_path('../public/data');
const state_dir = await make_absolute_path('./state');

let source_path = process.argv[2];
let source = basename(source_path, '.js');

let {
  minutes_of_sleep,
  minutes_of_sleep_if_failure,
  minutes_of_sleep_if_success,
  forage,
} = await import(source_path);

parentPort?.postMessage(minutes_of_sleep_if_failure ?? minutes_of_sleep);

let state_file = join(state_dir, `${source}.json`);
let current_state = read_json(state_file, {});

let dataset_files = await readdir(datasets_dir);
let datasets = (await Promise.all(dataset_files.map(async file => {
  let dataset = await import(join(datasets_dir, file));
  if (dataset.source !== source) return;

  let output_dir = join(parent_output_dir, basename(file, '.js'));
  await mkdir_p(output_dir);

  return { output_dir, ...dataset };
}))).filter(d => d !== undefined);

let { new_state={}, metadatas=[] } = await forage(current_state, datasets);

await write_json_atomically(state_file, new_state);

for (let [index, metadata] of metadatas.entries()) {
  let dataset = datasets[index];
  let output_dir = dataset.output_dir;

  metadata.name = dataset.name;
  metadata.path = `/${relative(absolute_path('../public'), output_dir)}/`;

  let metadata_file = join(output_dir, 'metadata.json');
  await write_json_atomically(metadata_file, metadata);
}

parentPort?.postMessage(minutes_of_sleep_if_success ?? minutes_of_sleep);
