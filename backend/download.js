import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { get } from 'https';
import { mkdir, writeFile } from 'fs/promises';
import { Buffer } from 'buffer';
import { stream_to_file, write_file_atomically } from './utility.js';

let cache_dir = join(dirname(fileURLToPath(import.meta.url)), 'cache');
await mkdir(cache_dir, { recursive: true });

export async function download_as_file(key, url, options={}) {
  let file = join(cache_dir, key);
  let response = await download_as_stream(url, options);
  
  if (response.headers['content-type'].startsWith('multipart/byteranges')) {
    await multipart_byteranges_to_file(file, response);
  } else {
    await stream_to_file(response, file);
  }
  return file;
}

export async function download_as_stream(url, options={}) {
  return new Promise((resolve, reject) => {
    get(url, options, response => {
      let { statusCode, statusMessage } = response;
      if (statusCode === 200 || statusCode === 206) {
        resolve(response);
      } else {
        response.resume();
        reject(`Unexpected HTTP status code ${statusCode} ${statusMessage}`);
      }
    }).on('error', reject);
  });
}

async function multipart_byteranges_to_file(file, response) {
  let chunks = [];
  for await (let chunk of response) chunks.push(chunk);
  let multipart_byteranges = Buffer.concat(chunks);

  let boundary = response.headers['content-type'].match(/boundary=(\S*)/)[1];

  let bodies = [];
  let start_delim = '\r\n\r\n';
  let end_delim = `\r\n--${boundary}`;
  let index = multipart_byteranges.indexOf(start_delim);

  while (index !== -1) {
    let start = index + start_delim.length;
    index = multipart_byteranges.indexOf(end_delim, index);
    bodies.push(multipart_byteranges.subarray(start, index));
    index = multipart_byteranges.indexOf(start_delim, index);
  }

  await write_file_atomically(file, Buffer.concat(bodies));
}
