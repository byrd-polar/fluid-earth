import { execFile as _execFile } from 'child_process';
import { DateTime } from "luxon";
import { mkdir } from 'fs/promises';
import path from 'path';
import { promisify } from 'util';
import * as util from './utility.js';
import fs from 'fs/promises';
import DomParser from 'dom-parser';

const execFile = promisify(_execFile);

const outputPath = path.join(util.OUTPUT_DIR, 'GEOS/');

const geos_props = {
    bytesPerFile: 2076480, // TODO
    width: 1152,
    height: 721,
    intervalInHours: 1,
    forecastIntervalInHours: 6,
    projection: 'GEOS',
};

const datasetBase = {
    name: 'Sulfur Dioxide Surface Mass',
    description: 'Sulfur Dioxide Surface Mass',
    path: util.browserPath(outputPath),
    unit: 'tempC',
    originalUnit: 'tempK',
    domain: [273.15 - 80, 273.15 + 55],
    colormap: 'MAGMA',
    bytesPerFile: 18662400,
    width: 4320,
    height: 2160,
    intervalInHours: 24,
    projection: 'GEOS',
};

const [inventory, writeAndUnlockInventory] = await util.lockAndReadInventory();

let dataset = inventory.find(d => d.path === datasetBase.path);
let datetime;

// if (dataset) {
//     datetime = DateTime.fromISO(dataset.end, { zone: 'utc' }).plus({ day: 1 });
// } else {
const now = DateTime.utc();
datetime = DateTime.utc(now.year, now.month, now.day).minus({ months: 1 });
inventory.push(dataset = datasetBase);
// }
const [inventory, writeAndUnlockInventory] = await util.lockAndReadInventory();
const [datetime, system] = await getDatetimeAndSystem(inventory);
const year = datetime.year;
const month = datetime.toFormat('LL');
const day = datetime.toFormat('dd');

if (dataset) {
    console.log(dataset);
    console.log(dataset.end);
} else {

}
debugger;
var parser = new DomParser();

const forecast = "inst1_2d_hwl_Nx";
const searchDir = 'https://portal.nccs.nasa.gov/datashare/gmao/geos-fp/das/' +
    `Y${year}/M${month}/D${day}/`;

const dataIndex = await util.download(searchDir, true);

function contains(dom, selector, text) {
    var elements = dom.getElementsByTagName(selector);
    return [].filter.call(elements, function (element) {
        return RegExp(text).test(element.textContent);
    });
}

var inputFilePath;
var html = await fs.readFile(dataIndex, 'utf8');

var dom = parser.parseFromString(html);
var matchingAnchor = contains(dom, "a", `${forecast}.${year}${month}${day}_0000z.nc4`);

inputFilePath = matchingAnchor[0].attributes[0]['value']; // 


const inputFile = await util.download(
    'https://portal.nccs.nasa.gov/datashare/gmao/geos-fp/das/' +
    `Y${year}/M${month}/D${day}/` + inputFilePath,
    true
);
await mkdir(outputPath, { mode: '775', recursive: true });


const outputFile = util.join(outputPath, datetime.toISO() + '.fp16');


// util.log('Converting NETCDF to fp16', inputFile, outputFile);
// const script = path.join('data', 'scripts', 'netcdf-to-fp16.js');
// await execFile('node', [script, inputFile, outputFile]);

for (const prop in datasetBase) dataset[prop] = datasetBase[prop];

dataset.start = dataset.start ?? datetime;
dataset.end = datetime;

await writeAndUnlockInventory(inventory);
