import { download, exit, OUTPUT_DIR } from './index.js';
import path from 'path';
import mapshaper from 'mapshaper';

const urls = [
  'https://github.com/nvkelso/natural-earth-vector/raw/master/50m_physical/ne_50m_graticules_all/ne_50m_graticules_10.shp',
  'https://github.com/nvkelso/natural-earth-vector/raw/master/50m_physical/ne_50m_rivers_lake_centerlines.shp',
  'https://github.com/nvkelso/natural-earth-vector/raw/master/50m_physical/ne_50m_lakes.shp',
  'https://github.com/nvkelso/natural-earth-vector/raw/master/50m_physical/ne_50m_coastline.shp',
];

export async function topology() {
  let files = await Promise.all(urls.map(async (url) => await download(url)));

  let outputFile = path.join(OUTPUT_DIR, 'topology.json');
  let cmds = `-i ${files.join(' ')} combine-files \
    -o ${outputFile} format=topojson`;

  let inputs = files.map((file) => `<= ${file}`).join('\n');
  console.log(`Generating topology...\n${inputs}\n=> ${outputFile}\n`);

  mapshaper.runCommands(cmds)
    .catch(err => {
      console.log(`Failed to generate topology...\n=> ${err}`);
      exit();
    });
}
