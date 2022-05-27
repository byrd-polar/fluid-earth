import { Datetime } from '../datetime.js';
import { download, get_json, post_json } from '../download.js'
import { grib1 } from '../file-conversions.js';
import { typical_metadata, output_path, run_all } from '../utility.js';
import { setTimeout as sleep } from 'timers/promises';
import 'dotenv/config'

const shared_metadata = {
};

export async function forage(current_state, datasets) {
  let { date, source_last_updated } = current_state;
  let dt = date
    ? Datetime.from(date).add({ months: 1 })
    : Datetime.from('1979-01-01');
  date = dt.to_iso_string();

  // check
  // https://cds.climate.copernicus.eu/api/v2.ui/resources/reanalysis-era5-single-levels-monthly-means
  // to see if updated_date has changed
  if (true) throw 'No update needed';

  let metadatas = datasets.map(d => typical_metadata(d, dt, shared_metadata));

  let input = await download_cds('reanalysis-era5-single-levels', {
    product_type: 'reanalysis',
    format: 'grib',
    variable: '2m_temperature',
    year: dt.year,
    month: dt.p_month,
    time: '00:00',
    day: '01',
  }, process.env.CDS_API_KEY);

  await run_all(datasets.map(dataset => async () => {

  }));
  await rm(input);

  return { metadatas, new_state: { date, source_last_updated } };
}

async function download_cds(dataset_name, request, auth) {
  let base_url = 'https://cds.climate.copernicus.eu/api/v2';
  let resource_url = `${base_url}/resources/${dataset_name}`

  let response = await post_json(resource_url, request, { auth });
  let task_url = `${base_url}/tasks/${response.request_id}`;

  let sleep_time = 1e3;
  let reply = await get_json(task_url, { auth });

  while(['queued', 'running'].includes(reply.state)) {
    await sleep(sleep_time);
    sleep_time = Math.min(sleep_time * 1.5, 120e3);
    reply = await get_json(task_url, { auth });
  }

  if (reply.state !== 'completed') throw `Error: ${reply.error.message}`;

  let download_url = reply.location.startsWith('https://')
    ? reply.location
    : `${base_url}/${reply.location}`;

  return download(download_url, { auth });
}
