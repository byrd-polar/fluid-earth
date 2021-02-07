import { lockAndReadInventory, download, OUTPUT_DIR, log } from './utility.js';
import { stat } from 'fs/promises';
import path from 'path';
import mapshaper from 'mapshaper';

const base = 'https://github.com/nvkelso/natural-earth-vector/raw/v4.1.0';
const urls = [
  base + '/50m_physical/ne_50m_graticules_all/ne_50m_graticules_10.shp',
  base + '/50m_physical/ne_50m_rivers_lake_centerlines.shp',
  base + '/50m_physical/ne_50m_lakes.shp',
  base + '/50m_physical/ne_50m_coastline.shp',
];

let [inventory, writeAndUnlockInventory] = await lockAndReadInventory();

let files = await Promise.all(urls.map(async (url) => await download(url)));

let outputFile = path.join(OUTPUT_DIR, 'topology.json');
let cmds = `-i ${files.join(' ')} combine-files \
  -o ${outputFile} format=topojson`;

log('Generating topology', files, outputFile);

await mapshaper.runCommands(cmds);

let dataset = inventory.find(d => d.name === 'topology');
if (!dataset) inventory.push(dataset = {});

dataset.name = 'topology';
dataset.path = '/data/topology.json';
dataset.lastUpdated = '2018-05-21';
dataset.bytes = (await stat(outputFile)).size;

await writeAndUnlockInventory(inventory);
