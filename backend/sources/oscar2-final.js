import { Datetime } from '../datetime.js';
import { download } from '../download.js';
import { output_path } from '../utility.js';
import { get_token } from './oscar.js';
import { rm } from 'fs/promises';

const shared_metadata = {
  width: 719,
  height: 1440,
  interval: 'daily-aggregate',
  projection: 'OSCAR2',
};

export async function forage(current_state, datasets) {
  return oscar2(current_state, datasets, 'final');
}

export async function oscar2(current_state, datasets, quality) {
  let { date } = current_state;
  let dt = date
    ? Datetime.from(date).add({ days: 1 })
    : get_start_dt(quality);
  date = dt.to_iso_string();

  let metadatas = datasets.map(({ metadata }) => {
    // avoid race conditions caused by multiple sources writing to same metadata
    if (quality !== 'nrt') return null;

    let start = get_start_dt('final').to_iso_string();
    let end = dt.to_iso_string();
    let new_state = { start, end };
    return { start, end, ...metadata, ...shared_metadata, new_state };
  });

  let token = await get_token(process.env.EARTHDATA_LOGIN);
  let input = await download(
    'https://archive.podaac.earthdata.nasa.gov/'
    + 'podaac-ops-cumulus-protected/'
    + `OSCAR_L4_OC_${quality.toUpperCase()}_V2.0/`
    + `oscar_currents_${quality}_${dt.year}${dt.p_month}${dt.p_day}.nc`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  await Promise.all(datasets.map(async dataset => {
    let output = output_path(dataset.output_dir, date);
    await dataset.convert(input, output, { variables: 'u,v' });
  }));
  await rm(input);

  return { metadatas, new_state: { date } };
}

const start_years = {
  final: 1993,
  interim: 2020,
  nrt: 2021,
};

function get_start_dt(quality) {
  return Datetime.from(`${start_years[quality]}-01-01T00:00:00.000Z`);
}
