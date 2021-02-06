import { existsSync } from 'fs';
import { writeFile } from 'fs/promises';
import path from 'path';
import { URL } from 'url';
import got from 'got';

export const CACHE_DIR = 'data/cache/';
export const OUTPUT_DIR = 'public/data/';
export const INVENTORY_FILE = 'public/data/inventory.json';

// pretty prints a file transformation operation
//
// - message is a string
// - input is a string or array of strings
// - output is a string or array of strings
//
// Example print:
//
// Generating topology...
// <= data/cache/ne_50m_graticules_10.shp
// <= data/cache/ne_50m_rivers_lake_centerlines.shp
// <= data/cache/ne_50m_lakes.shp
// <= data/cache/ne_50m_coastline.shp
// => public/data/topology.json
export function log(message, input=[], output=[]) {
  console.log(`${message}...`);

  input = Array.isArray(input) ? input : [input];
  for (const i of input) console.log(`<= ${i}`);

  output = Array.isArray(output) ? output : [output];
  for (const o of output) console.log(`=> ${o}`);

  console.log();
}

// downloads a file from url if it doesn't already exist in cache
//
// - set prefix to true if you want the whole URL in the file save path
// - suffix is appended to file save path
// - headers are sent with the request (used for HTTP range requests)
//
// returns a Promise that resolves to the path where file was saved to
export async function download(url, prefix=false, suffix='', headers={}) {
  url = new URL(url);

  let filename;
  if (prefix) {
    let fowardSlash = /\//g;
    filename = url.toString()
      .replace('://', '-')
      .replace(fowardSlash, '-')
      + suffix;
  } else {
    filename = path.basename(url.pathname);
  }
  let filepath = path.join(CACHE_DIR, filename);

  if (existsSync(filepath)) {
    log('Exists in cache, not re-downloading', [], filepath);
  } else {
    log('Downloading', url, filepath);
    try {
      let res = await got(url, { headers: headers });
      await writeFile(filepath, res.rawBody);
    } catch(err) {
      console.log(`Failed to download... ${url}\n=> ${err}`);
      throw err;
    }
  }
  return filepath;
}
