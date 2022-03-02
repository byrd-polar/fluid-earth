import { ZonedDateTime } from '../../src/components/calendar/miniTemporal.js';
import { download_as_file } from '../download.js';
import { grib2 } from '../file-conversions.js';
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
  let zdt;
  if (end) {
    zdt = new ZonedDateTime(new Date(end), true)
      .add({ days: 1 });
  } else {
    zdt = (new ZonedDateTime(new Date(), true))
      .round('day')
      .subtract({ days: 1 });
    start = zdt.date.toISOString();
  }
  end = zdt.date.toISOString();

  let year = zdt.year;
  let month = zdt.month.toString().padStart(2, '0');
  let day = zdt.day.toString().padStart(2, '0');

  let input = await download_as_file(
    `sst.${year}${month}${day}.grib2`,
    'https://nomads.ncep.noaa.gov/pub/data/nccf/com/gfs/prod/' +
    `sst.${year}${month}${day}/rtgssthr_grb_0.083_awips.grib2`
  );

  let output = join(datasets[0].output_dir, end + '.fp16.br');

  await grib2(input, output, { compression_level: 11 });

  return {
    metadatas: [{ start, end, ...metadata }],
    new_state: { start, end },
  };
}
