#!/bin/env node

// Convert stuff to fp16.br. For example:
//
// ./convert.js grib2 ./input.grib2 ./output.fp16.br "{ factor: 1e4 }"
//
// (assuming input.grib2 is a file in the current directory)

import * as conversions from '../file-conversions.js';

let [, , fn, input, output, options='{}'] = process.argv;
await conversions[fn](input, output, (new Function(`return ${options}`))());
