import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { platform } from 'os';
import path from 'path';
import { URL } from 'url';
import got from 'got';
import lockfile from 'proper-lockfile';

export const CACHE_DIR = path.join('data', 'cache');
export const OUTPUT_DIR = path.join('public', 'data');
export const INVENTORY_FILE = path.join(OUTPUT_DIR, 'inventory.json');

const windows = (platform() === 'win32');

// join paths with ISO dates in a safe way for windows
export function join(...args) {
  let newPath = path.join(...args);
  return windows ? newPath.replace(/:/g, '_' ) : newPath;
}

// converts local file system path to path for browser to use in a fetch call
//
// Example: public/data/topology.json => /data/topology.json
export function browserPath(outputPath) {
  return '/' + outputPath.split(path.sep).slice(1).join('/');
}

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
// - throttle is used to rate-limit api calls, a function that takes a
//   function and throttles its execution
//
// returns a Promise that resolves to the path where file was saved to
export async function download(
  url, prefix=false, suffix='', headers={}, throttle=(f => f())
) {
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
      let res = await throttle(() => got(url, { headers: headers }));
      await writeFile(filepath, res.rawBody);
    } catch(err) {
      console.log(`Failed to download... ${url}\n=> ${err}`);
      throw err;
    }
  }
  return filepath;
}

// read the inventory.json file and ensure only one caller can access it at a
// time using a lockfile
//
// returns the inventory object and a callback for writing to the inventory
// while releasing the lockfile
export async function lockAndReadInventory() {
  let release = await lockfile.lock(INVENTORY_FILE, { retries: 8 });
  let inventory = JSON.parse(await readFile(INVENTORY_FILE, 'utf8'));

  let writeAndUnlockInventory = async inventory => {
    await writeFile(INVENTORY_FILE, JSON.stringify(inventory, null, 2));
    release();
  };

  return [inventory, writeAndUnlockInventory];
}

// check if a URL exists (without having to download the whole file)
//
// intentionally strict as to not be mistaken for the cause of errors
export async function exists(url) {
  const response = await got(url, { method: 'HEAD', throwHttpErrors: false });
  return response.statusCode !== 404;
}
