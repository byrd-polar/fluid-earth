// Clamps x between min and max, inclusive
export function clamp(x, min, max) {
  return x > max ? max : (x < min ? min : x);
}

// Takes x modulo y with optional offset
export function modulo(x, y, offset=0) {
  return (((x - offset % y ) + y ) % y) + offset;
}

// Returns the closest valid date from the dataset relative to the given date
export function validDate(dataset, date) {
  if (dataset.intervalInHours === 'custom:OSCAR') {
    let year = date.getUTCFullYear();
    let candidates = [
      ...validOscarDates(year - 1),
      ...validOscarDates(year),
      ...validOscarDates(year + 1),
    ];
    // not at all an efficient search, optimize this part if it becomes an issue
    candidates.sort((d1, d2) => Math.abs(date - d1) - Math.abs(date - d2));
    return clamp(candidates[0], dataset.start, dataset.end);
  }

  let intervalInMilliseconds = (dataset.intervalInHours * 60 * 60 * 1000) || 1;
  let n = Math.round((date - dataset.start) / intervalInMilliseconds);
  let d = new Date(dataset.start.getTime() + intervalInMilliseconds * n);
  return clamp(d, dataset.start, dataset.end);
}

// Given a year, return the Dates that correspond to the OSCAR data that
// will be available that year (72 Dates with 5 or 6 day gaps) in order from
// earliest to latest
export function validOscarDates(year) {
  let leapYear = ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);

  return Array.from({length: 72}, (_, i) => {
    let day = Math.floor((leapYear ? 366 : 365) * i / 72);
    return new Date(Date.UTC(year, 0, 1 + day));
  });
}

import Qty from 'js-quantities/esm';

// Convert a value between units
export function convert(value, datasetOrData, newUnit) {
  if (!isFinite(value)) return value;

  return Qty(`${value} ${datasetOrData.originalUnit}`).to(newUnit).scalar;
}

// Make a pretty string for a unit from the 'js-quantities' library
export function prettyUnit(unit) {
  switch (unit) {
    case 'tempK': return 'K';
    case 'tempC': return '°C';
    case 'tempF': return '°F';
    // using Unicode instead of <sup> mainly because of text-shadow issues
    default: return unit.replace('^2', '²').replace('^3', '³');
  }
}

// Calculate a generic pin label for an object in the `pins` array
export function genericLabel(pins) {
  let genericPins = pins.filter(pin => pin.label.match(/Location [0-9]+/));
  let locationNums = genericPins.map(pin => parseInt(pin.label.split(' ')[1]));
  return `Location ${Math.max(0, ...locationNums) + 1}`;
}

// Make a pretty string for a lat-lon coordinate
export function prettyLatLon(latitude, longitude) {
  let latDirection = latitude >= 0 ? 'N' : 'S';
  let lonDirection = longitude >= 0 ? 'E' : 'W';
  return `${Math.abs(latitude).toFixed(2)}° ${latDirection}, \
          ${Math.abs(longitude).toFixed(2)}° ${lonDirection}`;
}

// Capitalize first letter, used instead of ::first-letter CSS because of text
// nodes behaving weirdly with text-shadows
export function capitalizeFirstLetter(str) {
  return str[0].toUpperCase() + str.substring(1);
}

// Fix the toLocaleTimeString output on Chromium-based browsers
export function fix24(timeString) {
  if (timeString === '24:00 UTC') return '00:00 UTC';

  return timeString;
}
