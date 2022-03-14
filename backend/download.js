import { make_absolute_path, stream_from_file } from './utility.js';
import { Buffer } from 'buffer';
import { createWriteStream } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import { get } from 'https';
import { join, basename } from 'path';
import { pipeline } from 'stream/promises';
import { v4 as uuidv4 } from 'uuid';

const cache_dir = await make_absolute_path('./cache');

export async function download(url, unique_path=true, options={}) {
  let file = join(cache_dir, unique_path ? uuidv4() : basename(url));
  let response = await download_as_stream(url, options);

  if (response.headers['content-type'].startsWith('multipart/byteranges')) {
    await multipart_byteranges_to_file(file, response);
  } else {
    await pipeline(response, createWriteStream(file));
  }
  return file;
}

async function download_as_stream(url, options={}) {
  return new Promise((resolve, reject) => {
    get(url, options, response => {
      let { statusCode, statusMessage } = response;
      if (statusCode === 200 || statusCode === 206) {
        resolve(response);
      } else {
        response.resume();
        reject(`Error: HTTP status code ${statusCode} ${statusMessage} ${url}`);
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

  await writeFile(file, Buffer.concat(bodies));
}
