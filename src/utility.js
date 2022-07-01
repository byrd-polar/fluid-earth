export async function fetchJson(url, options) {
  let response = await fetch(url, options);
  throwIfNotOk(response);
  return response.json();
}

export function throwIfNotOk(response) {
  if (!response.ok) {
    let { status, statusText, url } = response;
    throw new Error(`${`${status} ${statusText}`.trim()} - ${url}`);
  }
}

export function findClosestDateInAscendingList(date, candidates) {
  // can optimize by making this a binary search
  let inflection = candidates.findIndex(c => c - date > 0);
  if (inflection === 0) return candidates[0];
  if (inflection === -1) return candidates[candidates.length - 1];

  candidates = candidates.slice(inflection - 1, inflection + 1);
  candidates.sort((d1, d2) => Math.abs(date - d1) - Math.abs(date - d2));
  return candidates[0];
}

export function handleLikeButton(fn) {
  return e => (e.code === 'Space' || e.code === 'Enter') ? fn() : undefined;
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

const dsCache = new Map();

import { GriddedDataset } from './datasets.js';

// Return a copy of the dataset with the original colormaps/scales/domains from
// the old Fluid Earth Viewer
export function simplifyDataset(griddedDataset) {
  if (dsCache.has(griddedDataset)) return dsCache.get(griddedDataset);

  const simplifiedDatasets = {
    'temperature' : {
      colormap: 'TEMP',
      scale: 'linear',
      domain: [273.15 - 80, 273.15 + 55],
    },
    'wind': {
      colormap: 'WIND',
      scale: 'linear',
      domain: [0, 100],
    },
    'precipitation': {
      colormap: 'PRECIP_6H',
      scale: 'linear',
      domain: [0, 25],
    },
    'pressure': {
      colormap: 'MEAN_SEA_LEVEL_PRESSURE',
      scale: 'linear',
      domain: [96, 105],
    },
    'water in atmosphere': {
      colormap: 'TOTAL_PRECIP',
      scale: 'linear',
      domain: [0, 70],
    },
    'water in clouds': {
      colormap: 'TOTAL_CLOUD',
      scale: 'linear',
      domain: [0.0, 1.0],
    },
    'sea temperature': {
      colormap: 'SEA_SURFACE_TEMP',
      scale: 'linear',
      domain: [273.15 - 1.8, 273.15 + 31.5],
    },
    'currents': {
      colormap: 'CURRENTS',
      scale: 'linear',
      domain: [0.0, 1.5],
    },
    'ozone': {
      colormap: 'COLUMN_OZONE',
      scale: 'linear',
      domain: [200, 600],
    },
    'sulfur dioxide': {
      colormap: 'SO2_MASS',
      scale: 'linear',
      domain: [0, 100],
    },
    'carbon monoxide': {
      colormap: 'CO_SURFACE',
      scale: 'linear',
      domain: [1, 1000],
    },
    'dust': {
      colormap: 'DUST_MASS',
      scale: 'linear',
      domain: [0, 900],
    },
    'avg. temperature' : {
      colormap: 'TEMP',
      scale: 'linear',
      domain: [273.15 - 80, 273.15 + 55],
    },
    'avg. precipitation': {
      colormap: 'PRECIP_6H',
      scale: 'linear',
      domain: [0, 0.05],
    },
  };

  let core = {};
  let variable = Object.keys(variableFilters.simple).find(key => {
    return variableFilters.simple[key](griddedDataset.name);
  });
  let griddedDatasetCore = griddedDataset.core;
  let simplifiedDataset = simplifiedDatasets[variable];

  for (const prop in griddedDatasetCore) core[prop] = griddedDatasetCore[prop];
  for (const prop in simplifiedDataset) core[prop] = simplifiedDataset[prop];

  let dataset = new GriddedDataset(core);
  dsCache.set(griddedDataset, dataset);

  return dataset;
}
