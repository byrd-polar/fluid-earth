import { existsSync } from 'fs';
import { writeFile } from 'fs/promises';
import path from 'path';
import { URL } from 'url';
import got from 'got';

export const CACHE_DIR = 'data/cache/';
export const OUTPUT_DIR = 'public/data/';
export const INVENTORY_FILE = 'public/data/inventory.json';

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
    console.log(`Exists in cache, not re-downloading...\n=> ${filepath}\n`);
  } else {
    console.log(`Downloading...\n${url}\n=> ${filepath}\n`);
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
