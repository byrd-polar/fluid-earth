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
    console.log(`Exists in cache, not re-downloading...\n=> ${filepath}`);
  } else {
    console.log(`Downloading...\n${url}`);
    await got(url)
      .on('downloadProgress', p => {
        let percent = `${(p.percent * 100).toFixed(2)}%`
        let total = p.total === undefined ? 'unknown' : prettyBytes(p.total);
        let fraction = `${prettyBytes(p.transferred)} / ${total}`;
        let lineEnd = p.percent === 1 && p.transferred !== 0 ? '\n' : '\r';
        let progressInfo = `${percent} (${fraction})`;

        process.stdout.write(`=> ${filepath} ${progressInfo}${lineEnd}`);
      })
      .then(res => fsPromises.writeFile(filepath, res.rawBody))
      .catch(err => {
        console.log(`Failed to download... ${url}\n=> ${err}`);
        exit();
      });
  }
  console.log();
  return filepath;
}

// Stops the script and asks for it to be fixed -- most likely just need to
// update an URL
export function exit() {
  console.log('\nPlease fix this script.\n\nExiting...');
  process.exit();
}

main();
