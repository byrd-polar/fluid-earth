import { Datetime } from '../datetime.js';
import { download, get_json, post_json } from '../download.js'
import { grib1, grib1_normal, grib1_anomaly } from '../file-conversions.js';
import {
  output_path,
  run_all,
  perm_cache_dir,
  typical_metadata,
} from '../utility.js';
import { rm } from 'fs/promises';
import { join } from 'path';
import { setTimeout as sleep } from 'timers/promises';
import { parentPort } from 'worker_threads'
import { v4 as uuidv4 } from 'uuid';
import 'dotenv/config'

const name = 'reanalysis-era5-single-levels-monthly-means';

const shared_metadata = {
  width: 1440,
  height: 721,
  interval: 'monthly-aggregate',
  projection: 'ERA5',
};

export async function forage(current_state, datasets) {
  let { date, normals={} } = current_state;
  let dt = date
    ? Datetime.from(date).add({ months: 1 })
    : Datetime.from('1959-01-01');
  date = dt.to_iso_string();

  let metadatas = datasets.map(d => typical_metadata(d, dt, shared_metadata));
  let variables = [...new Set(datasets.map(d => d.variable))];

  // Work around an issue with the CDS API where data for certain months is
  // truncated if variables are in a particular order (e.g. total_precipitation
  // before 2m_temperature for 2023-02)
  variables.sort();

  let input = await download_cds(name, {
    product_type: ['monthly_averaged_reanalysis'],
    variable: variables,
    year: [`${dt.year}`],
    month: [dt.p_month],
    time: ['00:00'],
    data_format: 'grib',
    download_format: 'unarchived',
  }, process.env.CDS_API_KEY);

  await run_all(datasets.map(dataset => async () => {
    let output = output_path(dataset.output_dir, dt.to_iso_string());
    let record_number = variables.findIndex(v => v === dataset.variable) + 1;

    if (dataset.anomaly) {
      let normal = await get_normal(normals, dt, dataset.variable);
      await grib1_anomaly(normal, input, output, { record_number });

    } else {
      await grib1(input, output, { record_number });
    }
  }));
  await rm(input);

  return { metadatas, new_state: { date, normals } };
}

const count = 30;
const starting_year = 1991;

async function get_normal(normals, dt, variable) {
  normals[variable] ??= {};
  let month = dt.p_month;
  let normal = normals[variable][month];
  if (normal) return normal;

  let input = await download_cds(name, {
    product_type: ['monthly_averaged_reanalysis'],
    variable: [variable],
    year: Array.from({ length: count }, (_, i) => `${i + starting_year}`),
    month: [month],
    time: ['00:00'],
    data_format: 'grib',
    download_format: 'unarchived',
  }, process.env.CDS_API_KEY);
  let output = join(perm_cache_dir, uuidv4());
  normals[variable][month] = output;

  await grib1_normal(count, input, output, { record_number: 'all' });
  await rm(input);

  return output;
}

const base_url = 'https://cds-beta.climate.copernicus.eu/api';

async function download_cds(name, request, api_key) {
  let constraints_url = `${base_url}/retrieve/v1/processes/${name}/constraints`;

  let constraints = await post_json(constraints_url, { inputs: request });
  let data_available = Object.entries(request).every(([key, val]) => {
    val = Array.isArray(val) ? val : [val]
    return val.every(v => constraints[key].includes(v))
  })
  if (!data_available) throw new Error('Requested data not yet available');

  let submit_url = `${base_url}/retrieve/v1/processes/${name}/execution`;
  let headers = { 'PRIVATE-TOKEN': api_key };

  let response = await post_json(submit_url, { inputs: request }, { headers });
  if (response.status !== 'accepted') throw new Error('Process not accepted');

  let monitor_url = response.links.find(l => l.rel === 'monitor').href;

  let sleep_time = 1e3;
  let reply = await get_json(monitor_url, { headers });

  while(['accepted', 'running'].includes(reply.status)) {
    await sleep(sleep_time);
    sleep_time = Math.min(sleep_time * 1.5, 120e3);
    reply = await get_json(monitor_url, { headers });
    parentPort?.postMessage('keepalive');
  }

  if (reply.status !== 'successful' && reply.status !== 'failed') {
    throw new Error(`Process ${reply.status}`);
  }

  let results_url = reply.links.find(l => l.rel === 'results').href
  let results = await get_json(results_url, { headers })

  if (reply.status === 'failed') {
    throw new Error(`Process failed: ${results.json}`)
  }

  return download(results.asset.value.href, { headers });
}
