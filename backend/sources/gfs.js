import { Datetime } from '../datetime.js';
import { download } from '../download.js';
import { grib2 } from '../file-conversions.js';
import { map_to_metadatas, output_path, run_all } from '../utility.js';
import { readFile } from 'fs/promises';

export const shared_metadata = {
  width: 1440,
  height: 721,
  intervalInHours: 1,
  projection: 'GFS',
};

export async function forage(current_state, datasets) {
  let { fdt, dt, end, forecast, offset, system } =
    increment_gfs_state(current_state);

  let metadatas = map_to_metadatas(datasets, dt, end, shared_metadata);

  let url = 'https://nomads.ncep.noaa.gov/pub/data/nccf/com/gfs/prod/'
    + `${system}.${fdt.year}${fdt.p_month}${fdt.p_day}/${fdt.p_hour}/`
    + `atmos/${system}.t${fdt.p_hour}z.`
    + `pgrb2.0p25.f${offset.toString().padStart(3, '0')}`;

  let input = await download_gfs(url, datasets);

  await run_all(datasets.map(dataset => async () => {
    let output = output_path(dataset.output_dir, dt.to_iso_string());
    await grib2(input, output, {
      compression_level: system === 'gdas' && offset < 6 ? 11 : 6,
      ...dataset.grib2_options,
    });
  }));

  return { metadatas, new_state: { end, forecast, offset, system } };
}

export function increment_gfs_state(current_state) {
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

  return { fdt, dt, end, forecast, offset, system };
}

export async function download_gfs(url, datasets) {
  let matches = datasets.map(d => new RegExp(d.grib2_options.match));

  let idx = await download(url + '.idx');
  let arr = (await readFile(idx)).toString().split('\n');

  let index = arr.map((line, i) => {
    let start = line.split(':')[1];
    let end = arr[i+1]?.split(':')[1] - 1 || '';
    return { start, end, match: r => line.match(r) };
  }).filter(line => matches.some(line.match));

  for (let match of matches)
    if (!index.some(line => line.match(match)))
      throw `Error: could not find '${match}' in GFS index`;

  let Range = `bytes=${index.map(l => `${l.start}-${l.end}`).join(',')}`;

  return download(url, true, { headers: { Range } });
}
