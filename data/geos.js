import { execFile as _execFile } from 'child_process';
import { DateTime } from "luxon";
import { mkdir } from 'fs/promises';
import path from 'path';
import { promisify } from 'util';
import * as util from './utility.js';
import fs from 'fs/promises';
import DomParser from 'dom-parser';
import { debug } from 'console';

const script = path.join('data', 'scripts', 'netcdf-to-fp16.js');
const execFile = promisify(_execFile);

const outputPath = path.join(util.OUTPUT_DIR, 'GEOS/');

const geosProps = {
    bytesPerFile: 2076480, // TODO
    width: 1152,
    height: 721,
    intervalInHours: 1,
    forecastIntervalInHours: 6,
    projection: 'GEOS',
};

const geosVars = [
    {
        dataDir: 'geos-sulfur-dioxide-surface-mass/',
        varName: 'SO2SMASS',
        datasetBase: {
            name: 'Sulfur Dioxide Surface Mass',
            description: 'Sulfur Dioxide Surface Mass',
            path: util.browserPath(outputPath),
            unit: 'tempC',
            originalUnit: 'tempK',
            domain: [0, 100],
            colormap: 'MAGMA',
            ...geosProps
        }
    },
    {
        dataDir: 'geos-carbon-monoxide-surface-concentration/',
        varName: 'COSC',
        datasetBase: {
            name: 'Carbon Monoxide Surface Concentration',
            description: 'Carbon Monoxide Surface Concentration',
            path: util.browserPath(outputPath),
            unit: 'tempC',
            originalUnit: 'tempK',
            domain: [1, 1000],
            colormap: 'MAGMA',
            ...geosProps
        }
    },
    {
        dataDir: 'geos-dust-surface-mass-concentration/',
        varName: 'DUSMASS',
        datasetBase: {
            name: 'Dust Surface Mass Concentration',
            description: 'Dust Surface Mass Concentration',
            path: util.browserPath(outputPath),
            unit: 'tempC',
            originalUnit: 'tempK',
            domain: [0, 900],
            colormap: 'MAGMA',
            ...geosProps
        }
    }
]
const [inventory, writeAndUnlockInventory] = await util.lockAndReadInventory();

async function downloadGEOSData(year, month, day) {
    var parser = new DomParser();

    const forecast = "inst1_2d_hwl_Nx";
    const indexPageURL = 'https://portal.nccs.nasa.gov/datashare/gmao/geos-fp/das/' +
        `Y${year}/M${month}/D${day}/`;

    const indexPageFilename = await util.download(indexPageURL, true);

    function contains(dom, selector, text) {
        var elements = dom.getElementsByTagName(selector);
        return [].filter.call(elements, function (element) {
            return RegExp(text).test(element.textContent);
        });
    }

    var inputFilePath;
    var html = await fs.readFile(indexPageFilename, 'utf8');

    var dom = parser.parseFromString(html);
    var matchingAnchor = contains(dom, "a", `${forecast}.${year}${month}${day}_0000z.nc4`);

    inputFilePath = matchingAnchor[0].attributes[0]['value'];

    const inputFile = await util.download(
        'https://portal.nccs.nasa.gov/datashare/gmao/geos-fp/das/' +
        `Y${year}/M${month}/D${day}/` + inputFilePath,
        true
    );

    return inputFile;
}

for (const geosVar of geosVars) {
    const outputPath = path.join(util.OUTPUT_DIR, geosVar.dataDir);
    const geosVarName = geosVar.varName;
    await mkdir(outputPath, { mode: '775', recursive: true });

    let dataset = inventory.find(d => d.path === util.browserPath(outputPath));
    let datetime;

    if (dataset) {
        datetime = DateTime.fromISO(dataset.end, { zone: 'utc' }).plus({ day: 1 });
    } else {
        const now = DateTime.utc();
        datetime = DateTime.utc(now.year, now.month, now.day).minus({ days: 1 });
        inventory.push(dataset = geosVar.datasetBase);
    }

    const year = datetime.year;
    const month = datetime.toFormat('LL');
    const day = datetime.toFormat('dd');

    const inputFile = await downloadGEOSData(year, month, day);
    const filename = datetime.plus({ hours: f }).toISO() + '.fp16';
    const outputFile = util.join(outputPath, filename);

    util.log('Converting NETCDF to fp16', inputFile, outputFile);
    await execFile('node', [script, inputFile, outputFile, geosVarName]);



    for (const prop in geosVar.datasetBase) dataset[prop] = geosVar.datasetBase[prop];

    dataset.path = util.browserPath(outputPath);
    dataset.start = dataset.start ?? datetime;
    dataset.end = datetime;

}

await writeAndUnlockInventory(inventory);

debugger;