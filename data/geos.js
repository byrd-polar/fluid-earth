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
    bytesPerFile: 1661184,
    width: 1152,
    height: 721,
    intervalInHours: 1,
    forecastIntervalInHours: 6,
    projection: 'GEOS',
};

const hoursForecastStart = -2;
const hoursForwardDefault = 2; // TODO change back to 30
const hoursForward00 = 240;
const hoursForward12 = 120;

const geosVars = [
    {
        dataDir: 'geos-sulfur-dioxide-surface-mass/',
        varName: 'SO2SMASS',
        factor: 10e9,
        datasetBase: {
            name: 'Sulfur Dioxide Surface Mass',
            description: 'Sulfur Dioxide Surface Mass',
            path: util.browserPath(outputPath),
            unit: 'ug/m^3',
            originalUnit: 'ug/m^3',
            domain: [0, 100],
            colormap: 'SO2_MASS',
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
            unit: 'ppm',
            originalUnit: 'ppm', // TODO: allow for PPB
            domain: [1, 1000],
            colormap: 'CO_SURFACE',
            ...geosProps
        }
    },
    {
        dataDir: 'geos-dust-surface-mass-concentration/',
        varName: 'DUSMASS',
        factor: 10e9,
        datasetBase: {
            name: 'Dust Surface Mass Concentration',
            description: 'Dust Surface Mass Concentration',
            path: util.browserPath(outputPath),
            unit: 'ug/m^3',
            originalUnit: 'ug/m^3',
            domain: [0, 900],
            colormap: 'DUST_MASS',
            ...geosProps
        }
    }
]
const [inventory, writeAndUnlockInventory] = await util.lockAndReadInventory();

async function downloadGEOSData(dataset, datetime, hourShift) {

    const forecast = "inst1_2d_hwl_Nx";

    const year = datetime.year;
    const month = datetime.toFormat('LL');
    const day = datetime.toFormat('dd');
    const hour = datetime.toFormat('HH');

    const baseURL = 'https://portal.nccs.nasa.gov/datashare/gmao/geos-fp/forecast/' +
        `Y${year}/M${month}/D${day}/H${hour}/`;

    const nxtDatetime = datetime.plus({ hours: hourShift });
    const nxt_year = nxtDatetime.year;
    const nxt_month = nxtDatetime.toFormat('LL');
    const nxt_day = nxtDatetime.toFormat('dd');
    const nxt_hour = nxtDatetime.toFormat('HH')

    const forecastNameSyntax = `GEOS.fp.fcst.${forecast}.${year}${month}${day}_${hour}+` +
        `${nxt_year}${nxt_month}${nxt_day}_${nxt_hour}00.V01.nc4`;

    const inputFile = await util.download(baseURL + forecastNameSyntax);

    return inputFile;
}

for (const geosVar of geosVars) {
    const factor = geosVar.factor ?? 1;
    const outputPath = path.join(util.OUTPUT_DIR, geosVar.dataDir);
    const geosVarName = geosVar.varName;
    await mkdir(outputPath, { mode: '775', recursive: true });

    let dataset = inventory.find(d => d.path === util.browserPath(outputPath));
    let datetime;

    if (dataset) {
        datetime = DateTime.fromISO(dataset.lastForecast, { zone: 'utc' }).plus({ hour: geosVar.datasetBase.forecastIntervalInHours });
    } else {
        const now = DateTime.utc();
        datetime = DateTime.utc(now.year, now.month, now.day).minus({ hours: 18 });
        datetime.set()
        inventory.push(dataset = geosVar.datasetBase);
    }

    const hour = datetime.toFormat('HH');

    var forecastHours = hoursForwardDefault;
    if (hour == "00") {
        forecastHours = hoursForward00;
    } else if (hour == "12") {
        forecastHours = hoursForward12;
    }
    for (let f = hoursForecastStart; f <= forecastHours; f++) {
        const inputFile = await downloadGEOSData(dataset, datetime, f);
        const filename = datetime.plus({ hours: f }).toISO() + '.fp16';
        const outputFile = util.join(outputPath, filename);

        util.log('Converting NETCDF to fp16', inputFile, outputFile);
        await execFile('node', [script, inputFile, outputFile, geosVarName, factor]);
    }

    for (const prop in geosVar.datasetBase) dataset[prop] = geosVar.datasetBase[prop];

    dataset.path = util.browserPath(outputPath);
    dataset.start = dataset.start ?? datetime.plus({ hours: hoursForecastStart });

    if (dataset.end) {
        dataset.end = DateTime.max(
            datetime.plus({ hours: forecastHours }),
            DateTime.fromISO(dataset.end, { zone: 'utc' }),
        );
    } else {
        dataset.end = datetime.plus({ hours: forecastHours });
    }
    dataset.lastForecast = datetime;

}

await writeAndUnlockInventory(inventory);
