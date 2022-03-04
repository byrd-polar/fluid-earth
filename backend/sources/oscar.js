import { download } from '../download.js';
import { netcdf, netcdf_speed } from '../file-conversions.js';
import { Datetime } from '../datetime.js';
import { join } from 'path';

const reference_datetime = Datetime.from('1992-10-05');

export async function forage(current_state, datasets) {
  let { start, end } = current_state;
  let dt;
  if (end) {
    dt = Datetime.next_oscar_date(end);
  } else {
    dt = reference_datetime.add({ days: 7001 });
    start = dt.to_iso_string();
  }
  end = dt.to_iso_string();

  let input = await download(
    'https://podaac-opendap.jpl.nasa.gov/'
    + 'opendap/allData/oscar/preview/L4/oscar_third_deg/'
    + `oscar_vel${dt.days_since(reference_datetime)}.nc.gz.nc4`
  );

  let metadatas = await Promise.all(datasets.map(async dataset => {
    let output = join(dataset.output_dir, end + '.fp16.br');
    let metadata = dataset.metadata;
    let convert = metadata.particleDisplay ? netcdf : netcdf_speed;

    await convert(input, output, { variables: 'u,v', compression_level: 11 });

    return { start, end, ...metadata };
  }));

  return { metadatas, new_state: { start, end } };
}
