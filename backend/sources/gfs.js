import { Datetime } from '../datetime.js';
import { destructive_cat, download } from '../download.js';
import { grib2, grib2_acc } from '../file-conversions.js';
import { typical_metadata, output_path, run_all } from '../utility.js';
import { readFile, rm } from 'fs/promises';

export const shared_metadata = {
  width: 1440,
  height: 721,
  interval: 'hourly',
  projection: 'GFS',
};

export async function forage(current_state, datasets) {
  let { forecast, offset, system } = increment_state(current_state);
  let dt = Datetime.from(forecast).add({ hours: offset });

  let metadatas = datasets.map(d => {
    return d.accumulation && offset === 0
      ? null
      : typical_metadata(d, dt, shared_metadata);
  });

  let url = gfs_url({ forecast, offset, system });
  let compression_level = system === 'gdas' && offset < 6 ? 11 : 6;

  let simple_datasets = datasets.filter(d => !d.accumulation);
  await convert_simple(url, simple_datasets, dt, compression_level);

  if (offset !== 0) {
    let urls = [url, gfs_url(current_state)];
    let accum_datasets = datasets.filter(d => d.accumulation);
    await convert_accum(urls, accum_datasets, dt, offset, compression_level);
  }

  return { metadatas, new_state: { forecast, offset, system } };
}

export function increment_state(current_state) {
  let initial_forecast = () => {
    return Datetime.now().round('day').subtract({ hours: 36 }).to_iso_string();
  };
  let { forecast=initial_forecast(), offset=120, system='gfs' } = current_state;

  offset = (offset + 1) % (system === 'gfs' ? 121 : 10);
  system = offset === 0 ? (system === 'gfs' ? 'gdas' : 'gfs') : system;
  forecast = offset === 0 && system === 'gfs'
    ? Datetime.from(forecast).add({ hours: 6 }).to_iso_string()
    : forecast;

  return { forecast, offset, system };
}

export const base_url = 'https://ftpprd.ncep.noaa.gov/data/nccf/com/';
export const backup_url = 'https://nomads.ncep.noaa.gov/pub/data/nccf/com/';

function gfs_url({ forecast, offset, system }) {
  let fdt = Datetime.from(forecast);

  return base_url
    + 'gfs/prod/'
    + `${system}.${fdt.year}${fdt.p_month}${fdt.p_day}/${fdt.p_hour}/`
    + `atmos/${system}.t${fdt.p_hour}z.`
    + `pgrb2.0p25.f${offset.toString().padStart(3, '0')}`;
}

export async function convert_simple(url, datasets, dt, compression_level) {
  let input = await download_gfs(url, datasets);

  await run_all(datasets.map(dataset => async () => {
    let output = output_path(dataset.output_dir, dt.to_iso_string());
    await (dataset.convert ?? grib2)(input, output, {
      compression_level,
      ...dataset.grib2_options,
    });
  }));
  await rm(input);
}

async function convert_accum(urls, datasets, dt, offset, compression_level) {
  let input = offset === 1
    ? await download_gfs(urls[0], datasets)
    : await destructive_cat(await Promise.all(urls.map(url => {
        return download_gfs(url, datasets);
      })));

  await Promise.all(datasets.map(async dataset => {
    let simple = offset % dataset.accumulation.reset === 1;

    let output = output_path(dataset.output_dir, dt.to_iso_string());
    await (simple ? grib2 : grib2_acc)(input, output, {
      limit: simple ? 1 : 2,
      compression_level,
      ...dataset.grib2_options,
    });
  }));
  await rm(input);
}

async function download_gfs(url, datasets) {
  return _download_gfs(url, datasets)
    .catch(() => _download_gfs(url.replace(base_url, backup_url), datasets));
}

async function _download_gfs(url, datasets) {
  let idx_url = url + '.idx';
  let idx = await download(idx_url);
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
      throw new Error(`could not match enough '${match_regex}' in ${idx_url}`);
  }

  return download(url, { headers: { Range } });
}
