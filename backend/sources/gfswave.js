import { shared_metadata, increment_gfs_state, download_gfs } from './gfs.js';
import { grib2 } from '../file-conversions.js';
import { map_to_metadatas, output_path } from '../utility.js';
import { rm } from 'fs/promises';

export async function forage(current_state, datasets) {
  let { fdt, dt, end, forecast, offset, system } =
    increment_gfs_state(current_state);

  let metadatas = map_to_metadatas(datasets, dt, end, shared_metadata);

  let url = 'https://nomads.ncep.noaa.gov/pub/data/nccf/com/gfs/prod/'
    + `${system}.${fdt.year}${fdt.p_month}${fdt.p_day}/${fdt.p_hour}/`
    + `wave/gridded/${system}wave.t${fdt.p_hour}z.`
    + `global.0p25.f${offset.toString().padStart(3, '0')}.grib2`;

  let input = await download_gfs(url, datasets);

  await Promise.all(datasets.map(async dataset => {
    let output = output_path(dataset.output_dir, dt.to_iso_string());
    await grib2(input, output, {
      compression_level: system === 'gdas' && offset < 6 ? 11 : 6,
      ...dataset.grib2_options,
    });
  }));
  await rm(input);

  return { metadatas, new_state: { end, forecast, offset, system } };
}
