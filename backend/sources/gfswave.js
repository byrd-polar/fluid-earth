import { Datetime } from '../datetime.js';
import { download } from '../download.js';
import { grib2 } from '../file-conversions.js';
import { map_to_metadatas, output_path } from '../utility.js';
import { parse } from 'csv-parse/sync';
import { readFile } from 'fs/promises';

const shared_metadata = {
  width: 1440,
  height: 721,
  intervalInHours: 1,
  projection: 'GFS',
};

export async function forage(current_state, datasets) {
  let { end, forecast, offset, system } = current_state;
  let fdt;
  if (forecast) {
    fdt = Datetime.from(forecast);
    offset++;
    switch (system) {
      case 'gfs':
        if (offset > 120) {
          offset = 0;
          system = 'gdas';
        }
        break;
      case 'gdas':
        if (offset > 9) {
          fdt = fdt.add({ hours: 6 });
          offset = 0;
          system = 'gfs';
        }
        break;
      default:
        throw `Error: unrecognized system: ${system}`;
    }
  } else {
    fdt = Datetime.now().round('day').subtract({ hours: 36 });
    offset = 0;
    system = 'gdas';
  }
  forecast = fdt.to_iso_string();

  let dt = fdt.add({ hours: offset });
  end = !end || dt > Datetime.from(end) ? dt.to_iso_string() : end;

  let metadatas = map_to_metadatas(datasets, dt, end, shared_metadata);

  let url = 'https://nomads.ncep.noaa.gov/pub/data/nccf/com/gfs/prod/'
    + `${system}.${fdt.year}${fdt.p_month}${fdt.p_day}/${fdt.p_hour}/`
    + `wave/gridded/${system}wave.t${fdt.p_hour}z.`
    + `global.0p25.f${offset.toString().padStart(3, '0')}.grib2`;

  let index_buffer = await readFile(await download(url + '.idx'));
  let index = parse(index_buffer, { delimiter: ':' });
  let Range = 'bytes=' + datasets.map(dataset => {
    let i = index.findIndex(row => {
      return row[3] === dataset.parameter
          && row[4] === dataset.level;
    });
    if (i === -1) throw `Error: could not find ${dataset.name} in GFS index`;

    return `${index[i][1]}-${index[i+1]?.[1] - 1 || ''}`;
  }).join(',');

  let input = await download(url, true, { headers: { Range } });

  await Promise.all(datasets.map(async dataset => {
    let output = output_path(dataset.output_dir, dt.to_iso_string());
    await grib2(input, output, {
      compression_level: system === 'gdas' && offset < 6 ? 11 : 6,
      match: dataset.parameter,
    });
  }));

  return { metadatas, new_state: { end, forecast, offset, system } };
}
