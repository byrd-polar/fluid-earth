import { Datetime } from '../datetime.js';
import { download } from '../download.js';
import { grib2 } from '../file-conversions.js';
import { typical_metadata, output_path, run_all } from '../utility.js';
import { readFile, rm } from 'fs/promises';

export const shared_metadata = {
  width: 1440,
  height: 721,
  intervalInHours: 1,
  projection: 'GFS',
};

export async function forage(current_state, datasets) {
  let { fdt, dt, forecast, offset, system } =
    increment_gfs_state(current_state);

  let metadatas = datasets.map(d => typical_metadata(d, dt, shared_metadata));

  let url = 'https://nomads.ncep.noaa.gov/pub/data/nccf/com/gfs/prod/'
    + `${system}.${fdt.year}${fdt.p_month}${fdt.p_day}/${fdt.p_hour}/`
    + `atmos/${system}.t${fdt.p_hour}z.`
    + `pgrb2.0p25.f${offset.toString().padStart(3, '0')}`;

  let simple_datasets = datasets.filter(d => !d.accumulation);
  await convert_simple_gfs(url, simple_datasets, dt, system, offset);

  return { metadatas, new_state: { forecast, offset, system } };
}

export function increment_gfs_state(current_state) {
  let { forecast, offset, system } = current_state;
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

  return { fdt, dt, forecast, offset, system };
}

export async function convert_simple_gfs(url, datasets, dt, system, offset) {
  let input = await download_gfs(url, datasets);

  await run_all(datasets.map(dataset => async () => {
    let output = output_path(dataset.output_dir, dt.to_iso_string());
    await (dataset.convert ?? grib2)(input, output, {
      compression_level: system === 'gdas' && offset < 6 ? 11 : 6,
      ...dataset.grib2_options,
    });
  }));
  await rm(input);
}

async function download_gfs(url, datasets) {
  let idx = await download(url + '.idx');
  let idx_string = (await readFile(idx)).toString();
  let index = idx_string.split('\n').map((line, i, lines) => {
    let start = line.split(':')[1];
    let end = lines[i+1]?.split(':')[1] - 1 || '';
    return { line, range: `${start}-${end}` };
  });
  await rm(idx);

  let match_limits = new Map(datasets.map(dataset => {
    let { match, limit=1 } = dataset.grib2_options;
    return [ new RegExp(match), limit ];
  }));

  let Range = `bytes=${index.filter(row => {
    let has_match = false;
    for (let [match_regex, limit] of match_limits) {
      if (row.line.match(match_regex) && limit > 0) {
        match_limits.set(match_regex, limit - 1);
        has_match = true;
      }
    }
    return has_match;
  }).map(row => row.range).join(',')}`;

  for (let [match_regex, limit] of match_limits) {
    if (limit > 0)
      throw `Error: could not find enough '${match_regex}' in GFS index`;
  }

  return download(url, { headers: { Range } });
}
