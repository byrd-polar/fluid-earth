import { base_url } from './gfs.js';
import { Datetime } from '../datetime.js';
import { download } from '../download.js';
import { grib2 } from '../file-conversions.js';
import { typical_metadata, output_path } from '../utility.js';
import { rm } from 'fs/promises';

const metadata = {
  unit: 'tempC',
  originalUnit: 'tempK',
  domain: [273.15 - 1.8, 273.15 + 31.5],
  colormap: 'THERMAL',
  width: 4320,
  height: 2160,
  intervalInHours: 24,
  projection: 'RTGSSTHR',
};

export async function forage(current_state, datasets) {
  let { date } = current_state;
  let dt = date
    ? Datetime.from(date).add({ days: 1 })
    : Datetime.now().round('day').subtract({ days: 2 });
  date = dt.to_iso_string();

  let metadatas = datasets.map(d => typical_metadata(d, dt, metadata));

  let input = await download(
    base_url
    + `sst.${dt.year}${dt.p_month}${dt.p_day}/`
    + 'rtgssthr_grb_0.083_awips.grib2'
  );

  let output = output_path(datasets[0].output_dir, date);
  await grib2(input, output, { compression_level: 11 });
  await rm(input);

  return { metadatas, new_state: { date } };
}
