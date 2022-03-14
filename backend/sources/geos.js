import { Datetime } from '../datetime.js';
import { download } from '../download.js';
import { netcdf } from '../file-conversions.js';
import { output_path } from '../utility.js';

const shared_metadata = {
  width: 1152,
  height: 721,
  intervalInHours: 1,
  projection: 'GEOS',
};

export async function forage(current_state, datasets) {
  let { start, end, forecast, offset } = current_state;
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
  start ??= dt.to_iso_string();
  end = !end || dt > Datetime.from(end) ? dt.to_iso_string() : end;

  let input = await download(
    'https://portal.nccs.nasa.gov/datashare/gmao/geos-fp/forecast/'
    + `Y${fdt.year}/M${fdt.padded_month}/`
    + `D${fdt.padded_day}/H${fdt.padded_hour}/`
    + 'GEOS.fp.fcst.inst1_2d_hwl_Nx.'
    + `${fdt.year}${fdt.padded_month}${fdt.padded_day}_${fdt.padded_hour}+`
    + `${dt.year}${dt.padded_month}${dt.padded_day}_${dt.padded_hour}`
    + '00.V01.nc4'
  );

  let metadatas = await Promise.all(datasets.map(async dataset => {
    let output = output_path(dataset.output_dir, dt.to_iso_string());
    await netcdf(input, output, {
      compression_level: offset > 3 ? 6 : 11,
      ...dataset.netcdf_options,
    });

    return { start, end, ...dataset.unique_metadata, ...shared_metadata };
  }));

  return { metadatas, new_state: { start, end, forecast, offset } };
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
      throw `Corrupted state: invalid forecast hour: ${hour}`;
  }
}
