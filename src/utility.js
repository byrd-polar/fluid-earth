import { clamp, modulo } from './math.js';

// Returns the closest valid date from the dataset relative to the given date
export function validDate(dataset, date, oscarFilter=(() => true)) {
  if (dataset.intervalInHours === 'custom:OSCAR') {
    let year = date.getUTCFullYear();
    let candidates = [
      ...validOscarDates(year - 1),
      ...validOscarDates(year),
      ...validOscarDates(year + 1),
    ].filter(oscarFilter);
    // not at all an efficient search, optimize this part if it becomes an issue
    candidates.sort((d1, d2) => Math.abs(date - d1) - Math.abs(date - d2));
    return clamp(candidates[0], dataset.start, dataset.end);
  }

  let intervalInMilliseconds = (dataset.intervalInHours * 60 * 60 * 1000) || 1;
  let n = Math.round((date - dataset.start) / intervalInMilliseconds);
  let d = new Date(dataset.start.getTime() + intervalInMilliseconds * n);
  return clamp(d, dataset.start, dataset.end);
}

// Same as validDate, except returns null if the closest date is not "close
// enough", i.e. too before dataset.start or too after dataset.end
export function validCloseDate(dataset, date) {
  let closest = validDate(dataset, date);

  let maxDistance;
  if (dataset.intervalInHours === 'custom:OSCAR') {
    maxDistance =  6 * 24 * 60 * 60 * 1000;
  } else {
    maxDistance = dataset.intervalInHours * 60 * 60 * 1000;
  }
  if (Math.abs(closest - date) > maxDistance) return null;

  return closest;
}

import { validOscarDates } from './oscar.js';

// Return a list of all the valid dates for a dataset
export function getValidDates(dataset) {
  const dates = [];

  if (dataset.intervalInHours === 'custom:OSCAR') {
    let year = dataset.start.getUTCFullYear();
    while (year <= dataset.end.getUTCFullYear()) {
      dates.push(...validOscarDates(year));
      year++;
    }
    return dates.filter(d => d >= dataset.start && d <= dataset.end);
  }

  let t = dataset.start.getTime();
  while (t <= dataset.end.getTime()) {
    dates.push(new Date(t));
    t += dataset.intervalInHours * 60 * 60 * 1000;
  }
  return dates;
}

import Qty from 'js-quantities/esm';

// Convert a value between units
export function convert(value, originalUnit, newUnit) {
  if (!isFinite(value) || originalUnit === newUnit) return value;

  return Qty(`${value} ${originalUnit}`).to(newUnit).scalar;
}

// Make a pretty string for a unit from the 'js-quantities' library
export function prettyUnit(unit) {
  switch (unit) {
    case 'tempK': return 'K';
    case 'tempC': return '°C';
    case 'tempF': return '°F';
    case '0.0254 Mg/m^2': return 'in';
    case '0.01 Mg/m^2': return 'cm';
    // using Unicode instead of <sup> mainly because of text-shadow issues
    default: return unit.replace('^2', '²').replace('^3', '³');
  }
}

// Find an acceptable value for griddedUnit
export function validUnit(compatibleUnit, preferredUnits) {
  let qty = Qty.parse(compatibleUnit);
  let unitList = qty ? preferredUnits[qty.kind()] : null;

  return unitList ? unitList[0] : compatibleUnit;
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

// Translate dataset names into "plain english"
export function simpleTranslate(name) {
  const translations = {
    'temperature at 2 m above ground'       : 'temperature near surface',
    'temperature at 500 mb'                 : 'temperature at cloud level',
    'temperature at 200 mb'                 : 'temperature at cruise level',
    'relative humidity at 2 m above ground' : 'humidity near surface',
    'relative humidity at 500 mb'           : 'humidity at cloud level',
    'relative humidity at 200 mb'           : 'humidity at cruise level',
    'mean sea level pressure'               : 'pressure at sea level',
    'total precipitable water'              : 'water in atmosphere',
    'total cloud water'                     : 'water in clouds',
    'total ozone'                           : 'ozone in atmosphere',
    'significant wave height'               : 'wave height',
    'wind speed at 10 m above ground'       : 'wind speed near surface',
    'wind speed at 500 mb'                  : 'wind speed at cloud level',
    'wind speed at 200 mb'                  : 'wind speed at cruise level',
    'ocean surface currents speed'          : 'speed of sea surface currents',
    'wind at 10 m above ground'             : 'wind near surface',
    'wind at 500 mb'                        : 'wind at cloud level',
    'wind at 200 mb'                        : 'wind at cruise level',
    'ocean surface currents'                : 'sea surface currents',
  };
  return translations[name] || name;
}

import variableFilters from './menus/filters/variables.js';
import colormaps from './map/colormaps/';

const dsCache = new Map();

// Return a copy of the dataset with the original colormaps/scales/domains from
// the old Fluid Earth Viewer
export function simplifyDataset(griddedDataset) {
  if (dsCache.has(griddedDataset)) return dsCache.get(griddedDataset);

  const simplifiedDatasets = {
    'temperature' : {
      colormap: colormaps.TEMP,
      scale: 'linear',
      domain: [273.15 - 80, 273.15 + 55],
    },
    'wind': {
      colormap: colormaps.WIND,
      scale: 'linear',
      domain: [0, 100],
    },
    'precipitation': {
      colormap: colormaps.PRECIP_6H,
      scale: 'linear',
      domain: [0, 25],
    },
    'pressure': {
      colormap: colormaps.MEAN_SEA_LEVEL_PRESSURE,
      scale: 'linear',
      domain: [96, 105],
    },
    'water in atmosphere': {
      colormap: colormaps.TOTAL_PRECIP,
      scale: 'linear',
      domain: [0, 70],
    },
    'water in clouds': {
      colormap: colormaps.TOTAL_CLOUD,
      scale: 'linear',
      domain: [0.0, 1.0],
    },
    'sea temperature': {
      colormap: colormaps.SEA_SURFACE_TEMP,
      scale: 'linear',
      domain: [273.15 - 1.8, 273.15 + 31.5],
    },
    'currents': {
      colormap: colormaps.CURRENTS,
      scale: 'linear',
      domain: [0.0, 1.5],
    },
    'ozone': {
      colormap: colormaps.COLUMN_OZONE,
      scale: 'linear',
      domain: [200, 600],
    },
    'sulfur dioxide': {
      colormap: colormaps.SO2_MASS,
      scale: 'linear',
      domain: [0, 100],
    },
    'carbon monoxide': {
      colormap: colormaps.CO_SURFACE,
      scale: 'linear',
      domain: [1, 1000],
    },
    'dust': {
      colormap: colormaps.DUST_MASS,
      scale: 'linear',
      domain: [0, 900],
    },
  };

  let dataset = {};
  let variable = Object.keys(variableFilters.simple).find(key => {
    return variableFilters.simple[key](griddedDataset.name);
  });
  let simplifiedDataset = simplifiedDatasets[variable];

  for (const prop in griddedDataset) dataset[prop] = griddedDataset[prop];
  for (const prop in simplifiedDataset) dataset[prop] = simplifiedDataset[prop];

  dsCache.set(griddedDataset, dataset);

  return dataset;
}
