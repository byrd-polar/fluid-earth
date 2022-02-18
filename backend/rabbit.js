import { absolute_path } from './utility.js';
import { readdir } from 'fs/promises';
import { join, basename } from 'path';
import { parentPort } from 'worker_threads';

const datasets_dir = absolute_path('./datasets');

let source_path = process.argv[2];
let source = basename(source_path, '.js');

let {
  forage,
  minutes_of_sleep,
  minutes_of_sleep_if_failure,
  minutes_of_sleep_if_success,
} = await import(source_path);

let datasets = (await Promise.all(
  (await readdir(datasets_dir))
    .map(file => join(datasets_dir, file))
    .map(async path => await import(path))
)).filter(dataset => dataset.source === source);

parentPort?.postMessage(minutes_of_sleep_if_failure ?? minutes_of_sleep);

await forage(datasets);

parentPort?.postMessage(minutes_of_sleep_if_success ?? minutes_of_sleep);
