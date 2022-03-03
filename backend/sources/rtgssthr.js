import { download_as_file } from '../download.js';
import { grib2 } from '../file-conversions.js';
import { Datetime } from '../datetime.js';
import { join } from 'path';

const metadata = {
  unit: 'tempC',
  originalUnit: 'tempK',
  domain: [273.15 - 1.8, 273.15 + 31.5],
  colormap: 'THERMAL',
  bytesPerFile: 18662400,
  width: 4320,
  height: 2160,
  intervalInHours: 24,
  projection: 'RTGSSTHR',
};

export async function forage(current_state, datasets) {
  let { start, end } = current_state;
  let dt;
  if (end) {
    dt = Datetime.from(end).add({ days: 1 });
  } else {
    dt = Datetime.now().round('day').subtract({ days: 1 });
    start = dt.to_iso_string();
  }
  end = dt.to_iso_string();

  let dirname = `sst.${dt.year}${dt.padded_month}${dt.padded_day}`;

  let input = await download_as_file(
    `${dirname}.grib2`,
    'https://nomads.ncep.noaa.gov/pub/data/nccf/com/gfs/prod/' +
    `${dirname}/rtgssthr_grb_0.083_awips.grib2`
  );

  let output = join(datasets[0].output_dir, end + '.fp16.br');

  await grib2(input, output, { compression_level: 11 });

  return {
    metadatas: [{ start, end, ...metadata }],
    new_state: { start, end },
  };
}
