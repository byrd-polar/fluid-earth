import { download } from '../download.js';
import {
  hash_of_this_file,
  parent_output_dir,
  write_json_atomically,
} from '../utility.js';
import { parse } from 'csv-parse/sync';
import { rm } from 'fs/promises';
import StreamZip from 'node-stream-zip';
import { join } from 'path';

const url = 'https://simplemaps.com/static/data/world-cities/basic/'
          + 'simplemaps_worldcities_basicv1.75.zip';

const extra_locations = [
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
];

export async function forage(current_state) {
  let source_hash = await hash_of_this_file(import.meta);
  if (source_hash === current_state.source_hash) {
    throw new Error('No update needed');
  }

  let file = await download(url);
  let zip = new StreamZip.async({ file });
  let csv_buffer = await zip.entryData('worldcities.csv');
  await zip.close();
  await rm(file);

  let locations = csv_to_locations_json(parse(csv_buffer));
  let output = join(parent_output_dir, 'locations.json.br');
  await write_json_atomically(output, locations, true);

  return { new_state: { source_hash } };
}

function csv_to_locations_json(csv) {
  let header = csv.shift();

  let city_idx = header.indexOf('city');
  let admin_idx = header.indexOf('admin_name');
  let country_idx = header.indexOf('country');
  let latitude_idx = header.indexOf('lat');
  let longitude_idx = header.indexOf('lng');

  return csv.map(row => {
    let label = [
      row[city_idx],
      undo_reverse(row[admin_idx]),
      undo_reverse(row[country_idx]),
    ].filter(Boolean).join(', ');

    let longitude = parseFloat(row[longitude_idx]);
    let latitude = parseFloat(row[latitude_idx]);

    return { label, longitude, latitude };
  }).concat(extra_locations);
}

function undo_reverse(str) {
  let parts = str.split(', ');
  if (parts.length !== 2) return str;

  let [last, first] = parts;
  return [first, last].join(' ');
}
