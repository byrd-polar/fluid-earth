import { download } from '../download.js';
import {
  brotli,
  parent_output_dir,
  write_file_atomically,
} from '../utility.js';
import mapshaper from 'mapshaper';
import { join } from 'path';

const version = 'v5.0.0';
const base = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/';
const urls = [
  '/50m_physical/ne_50m_graticules_all/ne_50m_graticules_10.shp',
  '/50m_physical/ne_50m_rivers_lake_centerlines.shp',
  '/50m_physical/ne_50m_lakes.shp',
  '/50m_physical/ne_50m_coastline.shp',
].map(suffix => base + version + suffix);

export async function forage(current_state) {
  let { current_version } = current_state;
  if (version === current_version) throw 'No update needed';

  let files = await Promise.all(urls.map(url => download(url, false)));
  let input = files.join(' ');
  let output = join(parent_output_dir, 'topology.json.br');

  let cmds = `-i ${input} combine-files -o out.json format=topojson`;
  let topojson = (await mapshaper.applyCommands(cmds))['out.json'];

  await write_file_atomically(output, await brotli(topojson));

  return { new_state: { current_version: version } };
}
