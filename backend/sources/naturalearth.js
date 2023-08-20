import { download } from '../download.js';
import {
  brotli,
  hash_of_this_file,
  parent_output_dir,
  write_file_atomically,
} from '../utility.js';
import { rm } from 'fs/promises';
import mapshaper from 'mapshaper';
import { join } from 'path';

const base = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/'
           + 'v5.0.1/50m_physical/';
const urls = [
  'ne_50m_graticules_all/ne_50m_graticules_10.shp',
  'ne_50m_rivers_lake_centerlines.shp',
  'ne_50m_lakes.shp',
  'ne_50m_coastline.shp',
].map(suffix => base + suffix);

export async function forage(current_state) {
  let source_hash = await hash_of_this_file(import.meta);
  if (source_hash === current_state.source_hash) {
    throw new Error('No update needed');
  }

  let files = await Promise.all(urls.map(url => download(url, {}, false)));
  let output = join(parent_output_dir, 'topology.json.br');

  let cmds = `-i ${files.join(' ')} combine-files -o out.json format=topojson`;
  let topojson = (await mapshaper.applyCommands(cmds))['out.json'];
  await Promise.all(files.map(file => rm(file)));

  await write_file_atomically(output, await brotli(topojson));

  return { new_state: { source_hash } };
}
