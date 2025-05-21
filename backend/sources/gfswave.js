import {
  shared_metadata,
  increment_state,
  base_url,
  convert_simple,
} from './gfs.js';
import { Datetime } from '../datetime.js';
import { typical_metadata } from '../utility.js';

export async function forage(current_state, datasets) {
  let { forecast, offset, system } = increment_state(current_state);
  let dt = Datetime.from(forecast).add({ hours: offset });

  let metadatas = datasets.map(d => typical_metadata(d, dt, shared_metadata));

  let url = gfswave_url({ forecast, offset, system });
  let compression_level = system === 'gdas' && offset < 6 ? 11 : 6;

  await convert_simple(url, datasets, dt, compression_level);

  return { metadatas, new_state: { forecast, offset, system } };
}

function gfswave_url({ forecast, offset, system }) {
  let fdt = Datetime.from(forecast);

  return base_url
    + 'gfs/prod/'
    + `${system}.${fdt.year}${fdt.p_month}${fdt.p_day}/${fdt.p_hour}/`
    + `wave/gridded/${system}wave.t${fdt.p_hour}z.`
    + `global.0p25.f${offset.toString().padStart(3, '0')}.grib2`;
}
