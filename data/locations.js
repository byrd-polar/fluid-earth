import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { promisify } from 'util';

import { download, OUTPUT_DIR, CACHE_DIR, log } from './utility.js';

import extract from 'extract-zip';
import _parse from 'csv-parse';
const parse = promisify(_parse);

// Source + documentation: https://simplemaps.com/data/world-cities
// Creative Commons Attribution 4.0

const name = 'simplemaps_worldcities_basicv1.73';
const url = `https://simplemaps.com/static/data/world-cities/basic/${name}.zip`;
const file = 'worldcities.csv';

let zipFile = await download(url);
let outputFile = path.join(OUTPUT_DIR, 'locations.json');

log('Generating locations', zipFile, outputFile);
await extract(zipFile, { dir: path.resolve(CACHE_DIR, name) });

let csvString = await readFile(path.join(CACHE_DIR, name, file), 'utf8');
let csv = await parse(csvString);

let header = csv.shift();

let city = header.indexOf('city');
let admin = header.indexOf('admin_name');
let country = header.indexOf('country');
let latitude = header.indexOf('lat');
let longitude = header.indexOf('lng');

let locations = [];

for (let row of csv) {
  let arr = [
    row[city].replace(/,/g, ' '),
    reverseComma(row[admin]),
    reverseComma(row[country]),
  ];

  locations.push({
    label: arr.filter(Boolean).join(', '),
    longitude: parseFloat(row[longitude]),
    latitude: parseFloat(row[latitude]),
  });
}

locations = locations.concat([
  {
    label: 'McMurdo Station, Ross Island, Antarctica',
    longitude: 166.668235,
    latitude: -77.846323,
  },
  {
    label: 'Amundsen–Scott Station, South Pole, Antarctica',
    longitude: 0,
    latitude: -90,
  },
  {
    label: 'Santa\'s Workshop, North Pole, Arctic',
    longitude: 0,
    latitude: 90,
  },
]);

await writeFile(outputFile, JSON.stringify(locations));

function reverseComma(text) {
  text = text.split(', ');
  text.reverse();
  return text.join(' ');
}
