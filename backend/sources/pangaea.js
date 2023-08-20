import { Datetime } from '../datetime.js';
import { download } from '../download.js';
import { netcdf } from '../file-conversions.js';
import {
  hash_of_this_file,
  run_all,
  output_path,
} from '../utility.js';
import { rm } from 'fs/promises';

const dt = Datetime.from('2016-01-01');
const shared_metadata = {
  start: dt.to_iso_string(),
  end: dt.to_iso_string(),
  originalUnit: '%',
  unit: '%',
  domain: [0, 100],
  colormap: 'CREST_REVERSED',
  interval: 'yearly-aggregate',
  projection: 'PERMAFROST',
};

export async function forage(current_state, datasets) {
  let source_hash = await hash_of_this_file(import.meta);
  if (source_hash === current_state.source_hash) {
    throw new Error('No update needed');
  }

  let metadatas = datasets.map(
    ({ metadata }) => ({ ...shared_metadata, ...metadata })
  );

  await run_all(datasets.map(dataset => async () => {
    let input = await download(
      'https://store.pangaea.de/Publications/'
      + `ObuJ-etal_2018/UiO_PEX_5.0_20181127_2000_2016_${dataset.res}.nc`
    );
    let output = output_path(dataset.output_dir, dt.to_iso_string());
    await netcdf(input, output, { variables: 'PerProb', factor: 100 });
    await rm(input);
  }));

  return { metadatas, new_state: { source_hash } };
}
