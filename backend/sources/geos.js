import { Datetime } from '../datetime.js';
import { netcdf } from '../file-conversions.js';
import { typical_metadata, output_path } from '../utility.js';

const shared_metadata = {
  width: 1152,
  height: 721,
  intervalInHours: 1,
  projection: 'GEOS',
};

export async function forage(current_state, datasets) {
  let { forecast, offset } = current_state;
  let fdt;
  if (forecast) {
    fdt = Datetime.from(forecast);
    offset++;
    if (offset > max_offset_by_forecast_hour(fdt.hour)) {
      fdt = fdt.add({ hours: 6 });
      offset = -2;
    }
  } else {
    fdt = Datetime.now().round('day').subtract({ hours: 18 });
    offset = -2;
  }
  forecast = fdt.to_iso_string();

  let dt = fdt.add({ hours: offset });

  let metadatas = datasets.map(d => typical_metadata(d, dt, shared_metadata));

  let input = 'https://portal.nccs.nasa.gov/datashare/gmao/geos-fp/forecast/'
    + `Y${fdt.year}/M${fdt.p_month}/D${fdt.p_day}/H${fdt.p_hour}/`
    + 'GEOS.fp.fcst.inst1_2d_hwl_Nx.'
    + `${fdt.year}${fdt.p_month}${fdt.p_day}_${fdt.p_hour}+`
    + `${dt.year}${dt.p_month}${dt.p_day}_${dt.p_hour}`
    + '00.V01.nc4#mode=bytes';

  await Promise.all(datasets.map(async dataset => {
    let output = output_path(dataset.output_dir, dt.to_iso_string());
    await netcdf(input, output, {
      compression_level: offset > 3 ? 6 : 11,
      ...dataset.netcdf_options,
    });
  }));

  return { metadatas, new_state: { forecast, offset } };
}

function max_offset_by_forecast_hour(hour) {
  switch(hour) {
    case 6:
    case 18:
      return 30;
    case 0:
      return 240;
    case 12:
      return 120;
    default:
      throw `Error: invalid forecast hour: ${hour}`;
  }
}
