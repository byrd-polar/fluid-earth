// Clamps x between min and max, inclusive
export function clamp(x, min, max) {
  return x > max ? max : (x < min ? min : x);
}

// Returns the closest valid date from the dataset relative to the given date
export function validDate(dataset, date) {
  let intervalInMilliseconds = (dataset.intervalInHours * 60 * 60 * 1000) || 1;
  let n = Math.round((date - dataset.start) / intervalInMilliseconds);
  let d = new Date(dataset.start.getTime() + intervalInMilliseconds * n);
  return clamp(d, dataset.start, dataset.end);
}

import Qty from 'js-quantities/esm';

// Convert a value between units
export function convert(value, dataset, newUnit) {
  return Qty(`${value} ${dataset.originalUnit}`).to(newUnit).scalar;
}
