import fs from 'fs';
import { writeFile } from 'fs/promises';
import https from 'https';
import path from 'path';
import { URL } from 'url';
import got from 'got';

import { topology } from './topology.js';;
import { gfs } from './gfs.js';;

export const OUTPUT_DIR = 'public/data/';
const CACHE_DIR = 'data/cache/';

function main() {
  mkdir(OUTPUT_DIR);
  mkdir(CACHE_DIR);

  Promise.all([
    topology(),
    gfs(),
  ]).then(() => console.log('Data processing complete.'));
}

// create dir if path doesn't exist
function mkdir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { mode: '755' });
  }
}

// downloads a file from url if it doesn't already exist in cache
//
// set prefix to true if you want to whole URL in the file save path
// suffix is appended to file save path
// headers are sent with the request (used for HTTP range requests)
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

  if (fs.existsSync(filepath)) {
    console.log(`Exists in cache, not re-downloading...\n=> ${filepath}\n`);
  } else {
    console.log(`Downloading...\n${url}\n=> ${filepath}\n`);
    try {
      let res = await got(url, { headers: headers });
      await writeFile(filepath, res.rawBody);
    } catch(err) {
      console.log(`Failed to download... ${url}\n=> ${err}`);
      exit();
    }
  }
  return filepath;
}

// Stops the script and asks for it to be fixed -- most likely just need to
// update an URL
export function exit() {
  console.log('\nPlease fix this script.\n\nExiting...');
  process.exit();
}

main();
