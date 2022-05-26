import {
  absolute_path,
  datasets_state_dir,
  json_dir_to_obj,
  mkdir_p,
  parent_output_dir,
  read_json,
  sources_state_dir,
  write_json_atomically,
} from './utility.js';
import { readdir } from 'fs/promises';
import { basename, join, relative } from 'path';

let heart = { last_beat: new Date().toISOString() };
let heart_file = join(parent_output_dir, 'heart.json');
await write_json_atomically(heart_file, heart);

const datasets_dir = absolute_path('./datasets');

let source_path = process.argv[2];
let source = basename(source_path, '.js');

let { forage } = await import(source_path);

let state_file = join(sources_state_dir, `${source}.json`);
let current_state = await read_json(state_file, {});

let dataset_files = (await readdir(datasets_dir))
  .filter(file => basename(file, '.js').split('-')[0] === source);

let datasets = (await Promise.all(dataset_files.map(async file => {
  let filename = basename(file, '.js');
  let output_dir = join(parent_output_dir, filename);
  let state_file = join(datasets_state_dir, `${filename}.json`);
  await mkdir_p(output_dir);
  return {
    output_dir,
    ...(await import(join(datasets_dir, file))),
    state_file,
    current_state: await read_json(state_file, {}),
  };
})));

let { new_state={}, metadatas=[] } = await forage(current_state, datasets);

new_state = { last_successful_update: new Date().toISOString(), ...new_state };
await write_json_atomically(state_file, new_state);

for (let [index, metadata] of metadatas.entries()) {
  if (!metadata) continue;

  let dataset = datasets[index];

  await write_json_atomically(dataset.state_file, metadata.new_state ?? {});
  delete metadata.new_state;

  let output_dir = dataset.output_dir;
  let name = dataset.name;
  let path = `/${relative(absolute_path('../public'), output_dir)}/`;
  metadata = { name, path, ...metadata };

  let metadata_file = join(output_dir, 'metadata.json');
  await write_json_atomically(metadata_file, metadata);
}

let inventory = (await Promise.all(
  (await readdir(parent_output_dir, { withFileTypes: true }))
    .filter(entry => entry.isDirectory())
    .map(dir => join(parent_output_dir, dir.name, 'metadata.json'))
    .map(file => read_json(file, null))))
  .filter(Boolean);

let inventory_file = join(parent_output_dir, 'inventory.json.br');
await write_json_atomically(inventory_file, inventory, true);

let state_summary = await json_dir_to_obj(absolute_path('./state'));
let state_summary_file = join(parent_output_dir, 'state.json');
await write_json_atomically(state_summary_file, state_summary);
