import { Datetime } from '../datetime.js';
import { download } from '../download.js';
import { typical_metadata, output_path } from '../utility.js';
import { get_token } from './oscar.js';
import { rm } from 'fs/promises';

const shared_metadata = {
  width: 719,
  height: 1440,
  interval: 'daily-aggregate',
  projection: 'OSCAR2',
};

export async function forage(current_state, datasets) {
  let { date } = current_state;
  let dt = date
    ? Datetime.from(date).add({ days: 1 })
    : Datetime.from('1993-01-01T00:00:00.000Z');
  date = dt.to_iso_string();

  let metadatas = datasets.map(d => typical_metadata(d, dt, shared_metadata));

  let token = await get_token(process.env.EARTHDATA_LOGIN);
  let input = await download(
    'https://archive.podaac.earthdata.nasa.gov/'
    + 'podaac-ops-cumulus-protected/OSCAR_L4_OC_FINAL_V2.0/'
    + `oscar_currents_final_${dt.year}${dt.p_month}${dt.p_day}.nc`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  await Promise.all(datasets.map(async dataset => {
    let output = output_path(dataset.output_dir, date);
    await dataset.convert(input, output, { variables: 'u,v' });
  }));
  await rm(input);

  return { metadatas, new_state: { date } };
}
