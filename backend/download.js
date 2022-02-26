import { make_absolute_path, stream_from_file } from './utility.js';
import { Buffer } from 'buffer';
import { createWriteStream } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import { get } from 'https';
import { join } from 'path';
import { Readable } from 'stream';

const cache_dir = await make_absolute_path('./cache');

export async function download_as_file(key, url, options={}) {
  let file = file_from_cache(key);
  let response = await download_as_stream(url, options);

  if (response.headers['content-type'].startsWith('multipart/byteranges')) {
    await multipart_byteranges_to_file(file, response);
  } else {
    await pipeline(response, createWriteStream(file));
  }
  return file;
}

export function file_from_cache(key) {
  return join(cache_dir, key);
}

export async function stream_from_cache(key_or_keys) {
  let keys = typeof key_or_keys === 'string' ? [key_or_keys] : key_or_keys;
  let streams = await Promise.all(keys.map(async key => {
    return await stream_from_file(file_from_cache(key));
  }));
  return Readable.from((async function* concat() {
    for (const stream of streams) {
      for await (const chunk of stream) yield chunk;
    }
  })());
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

  await writeFile(file, Buffer.concat(bodies));
}
