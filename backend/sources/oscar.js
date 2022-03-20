import { Datetime } from '../datetime.js';
import { download } from '../download.js';
import { map_to_metadatas, output_path } from '../utility.js';
import { rm } from 'fs/promises';

const reference_datetime = Datetime.from('1992-10-05');

const shared_metadata = {
  width: 1201,
  height: 481,
  intervalInHours: 'custom:OSCAR',
  projection: 'OSCAR',
};

export async function forage(current_state, datasets) {
  let { start, end } = current_state;
  let dt = end
    ? Datetime.next_oscar_date(end)
    : reference_datetime.add({ days: 7001 });
  end = dt.to_iso_string();

  let metadatas = map_to_metadatas(datasets, dt, end, shared_metadata);

  let input = await download(
    'https://podaac-opendap.jpl.nasa.gov/'
    + 'opendap/allData/oscar/preview/L4/oscar_third_deg/'
    + `oscar_vel${dt.days_since(reference_datetime)}.nc.gz.nc4`
  );

  await Promise.all(datasets.map(async dataset => {
    let output = output_path(dataset.output_dir, end);
    await dataset.convert(input, output, { variables: 'u,v' });
  }));
  await rm(input);

  return { metadatas, new_state: { start, end } };
}
