import { temp_cache_dir } from './utility.js';
import { Buffer } from 'buffer';
import { createReadStream, createWriteStream } from 'fs';
import { rm, writeFile } from 'fs/promises';
import { get, request } from 'https';
import { join, basename } from 'path';
import { pipeline } from 'stream/promises';
import { v4 as uuidv4 } from 'uuid';

export async function download(url, options={}, unique_path=true) {
  let file = join(temp_cache_dir, unique_path ? uuidv4() : basename(url));
  let response = await download_as_stream(url, options);

  if (response.headers['content-type'].startsWith('multipart/byteranges')) {
    await multipart_byteranges_to_file(file, response);
  } else {
    await pipeline(response, createWriteStream(file));
  }
  return file;
}

export async function destructive_cat(files) {
  let file = join(temp_cache_dir, uuidv4());

  await pipeline(async function* () {
    for (let stream of files.map(input_file => createReadStream(input_file)))
      for await (let chunk of stream) yield chunk;
  }, createWriteStream(file));

  for (let input_file of files) await rm(input_file);

  return file;
}

export async function get_json(url, options={}) {
  let response = await download_as_stream(url, options);
  return stream_to_json(response);
}

export async function post_json(url, json, options={}) {
  let body = JSON.stringify(json);
  let opts = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    },
    ...options,
  };
  let response = await new Promise((resolve, reject) => {
    request(url, opts, res => handle_response(res, resolve, reject, url))
      .on('error', reject)
      .end(body);
  });
  return stream_to_json(response);
}

async function download_as_stream(url, options={}) {
  return new Promise((resolve, reject) => {
    get(url, options, res => handle_response(res, resolve, reject, url))
      .on('error', reject);
  });
}

function handle_response(response, resolve, reject, url) {
  let { statusCode, statusMessage } = response;
  if ([200, 202, 206].includes(statusCode)) {
    resolve(response);
  } else {
    response.resume();
    reject(`Error: HTTP status ${statusCode} ${statusMessage} for ${url}`);
  }
}

async function multipart_byteranges_to_file(file, response) {
  let multipart_byteranges = await stream_to_buffer(response);
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

async function stream_to_json(stream) {
  let buffer = await stream_to_buffer(stream);
  return JSON.parse(buffer.toString());
}

async function stream_to_buffer(stream) {
  let chunks = [];
  for await (let chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}
