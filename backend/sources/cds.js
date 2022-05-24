import 'dotenv/config' 
import { download, get_json, post_json } from '../download.js'
import { setTimeout as sleep } from 'timers/promises';

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

  if (reply.state !== 'completed') throw reply.error;

  let download_url = reply.location.startsWith('https://')
    ? reply.location
    : `${base_url}/${reply.location}`;

  return download(download_url, { auth });
}

await download_cds('reanalysis-era5-single-levels', {
  product_type: 'reanalysis',
  format: 'grib',
  variable: '2m_temperature',
  year: '2021',
  month: '08',
  time: '00:00',
  day: '01',
}, process.env.CDS_API_KEY);
