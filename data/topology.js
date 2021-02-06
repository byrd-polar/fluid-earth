import { download, OUTPUT_DIR } from './utility.js';

import path from 'path';
import mapshaper from 'mapshaper';

const base = 'https://github.com/nvkelso/natural-earth-vector/raw/master';
const urls = [
  base + '/50m_physical/ne_50m_graticules_all/ne_50m_graticules_10.shp',
  base + '/50m_physical/ne_50m_rivers_lake_centerlines.shp',
  base + '/50m_physical/ne_50m_lakes.shp',
  base + '/50m_physical/ne_50m_coastline.shp',
];

let files = await Promise.all(urls.map(async (url) => await download(url)));

let outputFile = path.join(OUTPUT_DIR, 'topology.json');
let cmds = `-i ${files.join(' ')} combine-files \
  -o ${outputFile} format=topojson`;

let inputs = files.map((file) => `<= ${file}`).join('\n');
console.log(`Generating topology...\n${inputs}\n=> ${outputFile}\n`);

await mapshaper.runCommands(cmds);
