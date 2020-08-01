import fs from 'fs';
import fsPromises from 'fs/promises';
import https from 'https';
import path from 'path';
import { URL } from 'url';
import got from 'got';
import prettyBytes from 'pretty-bytes';

import { topology } from './topology.js';;

export const OUTPUT_DIR = 'public/data/';
const CACHE_DIR = 'data/cache/';

function main() {
  mkdir(OUTPUT_DIR);
  mkdir(CACHE_DIR);

  Promise.all([
    topology(),
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
// returns a Promise that resolves to the path where file was saved to
export async function download(url) {
  url = new URL(url);

  let filepath = path.join(
    CACHE_DIR,
    `${path.basename(url.pathname)}${url.search}`
  );

  if (fs.existsSync(filepath)) {
    console.log(`Exists in cache, not re-downloading...\n=> ${filepath}\n`);
  } else {
    console.log(`Downloading...\n${url}\n=> ${filepath}\n`);
    await got(url)
      .then(res => fsPromises.writeFile(filepath, res.rawBody))
      .catch(err => {
        console.log(`Failed to download... ${url}\n=> ${err}`);
        exit();
      });
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
