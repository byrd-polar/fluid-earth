export async function fetchPreloadedJson(url) {
  return fetchJson(url, {
    mode: 'no-cors',
    credentials: 'include',
  })
}

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

let id = 0;

export function uniqueId() {
  return id++;
}
