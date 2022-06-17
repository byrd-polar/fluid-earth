// Clamps x between min and max, inclusive
export function clamp(x, min, max) {
  return x > max ? max : (x < min ? min : x);
}

// Takes x modulo y with optional offset
export function modulo(x, y, offset=0) {
  return ((((x - offset) % y ) + y ) % y) + offset;
}

// Get a random longitude coordinate from a uniform distribution by area
export function randlon() {
  return 360 * Math.random() - 180;
}

// Get a random latitude coordinate from a uniform distribution by area
export function randlat() {
  return (180 / Math.PI) * Math.asin(2 * Math.random() - 1);
}
