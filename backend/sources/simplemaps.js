import { download } from '../download.js';
import { parent_output_dir, write_json_atomically } from '../utility.js';
import { parse } from 'csv-parse/sync';
import StreamZip from 'node-stream-zip';
import { join } from 'path';

const version = 'v1.73';
const url = 'https://simplemaps.com/static/data/world-cities/basic/' +
  `simplemaps_worldcities_basic${version}.zip`;

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
  let { current_version } = current_state;

  if (version !== current_version) {
    let zip = new StreamZip.async({ file: await download(url) });
    let csv_buffer = await zip.entryData('worldcities.csv');
    await zip.close();

    let locations = csv_to_locations_json(parse(csv_buffer));
    let output = join(parent_output_dir, 'locations.json');
    await write_json_atomically(output, locations);
  }

  return { new_state: { current_version: version } };
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
