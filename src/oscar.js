// These functions are in their own separate file to simplify the import tree.

// Given a date, get the next date afterwards with OSCAR data
export function nextOscarDate(currentDate) {
  let year = currentDate.getUTCFullYear();
  let dates = [
    ...validOscarDatesForYear(year),
    ...validOscarDatesForYear(year + 1),
  ];
  return dates.find(d => d > currentDate);
}

let cache = new Map();

function getKey(startDate, endDate) {
  return `${startDate.getTime()}|${endDate.getTime()}`;
}

// Get all dates with OSCAR data between given start and end dates, inclusive
export function validOscarDates(startDate, endDate) {
  let key = getKey(startDate, endDate);
  if (cache.has(key)) return cache.get(key);

  let startYear = startDate.getUTCFullYear();
  let endYear = endDate.getUTCFullYear();
  let dates = [];
  for (let year = startYear; year <= endYear; year++) {
    dates.push(...validOscarDatesForYear(year));
  }

  dates = dates.filter(d => d >= startDate && d <= endDate);
  cache.set(key, dates);
  return dates;
}

// Given a year, return the Dates that correspond to the OSCAR data that
// will be available that year (72 Dates with 5 or 6 day gaps) in order from
// earliest to latest
function validOscarDatesForYear(year) {
  let leapYear = ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);

  return Array.from({length: 72}, (_, i) => {
    let day = Math.floor((leapYear ? 366 : 365) * i / 72);
    return new Date(Date.UTC(year, 0, 1 + day));
  });
}
