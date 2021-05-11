import * as util from './utility.js';
import { DateTime } from "luxon";
import { mkdir } from 'fs/promises';
import path from 'path';
import { promisify } from 'util';
import { execFile as _execFile } from 'child_process';
const execFile = promisify(_execFile);


let interval = (365/72);
let dayOffsets = [];
for(let i =0; i <= 71; i++){
  dayOffsets.push(Math.floor(i*interval));
}
console.log(dayOffsets);

let dates = [];
for(let i = 0; i <= 71; i++){
  let date = new Date(new Date.UTC().getFullYear(), 0, 1);
  date.setDate(date.getDate() + dayOffsets[i]);
  dates.push(date);
}
console.log(dates);
/* Caluclates the number of days that have
 past since October 5, 1992
 @param month must be an integer in the format xx
 @param day must be an integer in the format xx
 @param year must be in the format xxxx
 @return difference the number of days past since 10/05/1992/*/
function daysPast(month, day, year){
  var currentDate = new Date(month +"/"+ day + "/" + year);
  var startDate = new Date("10/05/1992");

  const date1utc = Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  const date2utc = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  var timeDifference = (date1utc - date2utc)/(1000*60*60*24);

  return timeDifference;
}

/* Constructs file path for given date */
/* var outputDate = daysPast('06', '01', '2020');
const inputFile = await util.download('https://podaac-opendap.jpl.nasa.gov/opendap/allData/oscar/'+
  'preview/L4/oscar_third_deg/oscar_vel'+ outputDate +'.nc.gz');



console.log('https://podaac-opendap.jpl.nasa.gov/opendap/allData/oscar/'+
  'preview/L4/oscar_third_deg/oscar_vel'+ outputDate +'.nc.gz');
console.log(inputFile);


const variable = "u";
const outputFile = variable+'.fp16';
//const factor = 1; //<determine what factor is needed to get data to integer without loss>

util.log('Converting netcdf to fp16', inputFile, variable, outputFile);
await execFile('node', ['data/scripts/netcdf-to-fp16.js', inputFile, outputFile, variable]); */
