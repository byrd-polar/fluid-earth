import {
  shared_metadata,
  increment_gfs_state,
  convert_simple_gfs,
} from './gfs.js';
import { map_to_metadatas } from '../utility.js';

export async function forage(current_state, datasets) {
  let { fdt, dt, end, forecast, offset, system } =
    increment_gfs_state(current_state);

  let metadatas = map_to_metadatas(datasets, dt, end, shared_metadata);

  let url = 'https://nomads.ncep.noaa.gov/pub/data/nccf/com/gfs/prod/'
    + `${system}.${fdt.year}${fdt.p_month}${fdt.p_day}/${fdt.p_hour}/`
    + `wave/gridded/${system}wave.t${fdt.p_hour}z.`
    + `global.0p25.f${offset.toString().padStart(3, '0')}.grib2`;

  await convert_simple_gfs(url, datasets, dt, system, offset);

  return { metadatas, new_state: { end, forecast, offset, system } };
}
