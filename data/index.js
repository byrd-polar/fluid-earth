import * as fs from 'fs';
import * as fsPromises from 'fs/promises';
import * as https from 'https';
import * as path from 'path';
import { URL } from 'url';
import got from 'got';
import prettyBytes from 'pretty-bytes';

import { coastlines } from './coastlines.js';

export const OUTPUT_DIR = 'public/data/';
const CACHE_DIR = 'data/cache/';

function main() {
  mkdir(OUTPUT_DIR);
  mkdir(CACHE_DIR);

  coastlines();
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
  let filepath = path.join(CACHE_DIR, path.basename((new URL(url)).pathname));

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
