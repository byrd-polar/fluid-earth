import { Datetime } from '../datetime.js';
import { download } from '../download.js';
import { grib2 } from '../file-conversions.js';
import { output_path } from '../utility.js';

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
  let { end } = current_state;
  let dt = end
    ? Datetime.from(end).add({ days: 1 })
    : Datetime.now().round('day').subtract({ days: 2 });
  end = dt.to_iso_string();

  let input = await download(
    'https://nomads.ncep.noaa.gov/pub/data/nccf/com/gfs/prod/'
    + `sst.${dt.year}${dt.p_month}${dt.p_day}/`
    + 'rtgssthr_grb_0.083_awips.grib2'
  );

  let output = output_path(datasets[0].output_dir, end);
  await grib2(input, output, { compression_level: 11 });

  let start = datasets[0].current_state.start ?? dt.to_iso_string();

  return {
    metadatas: [{ start, end, ...metadata, new_state: { start } }],
    new_state: { end },
  };
}
