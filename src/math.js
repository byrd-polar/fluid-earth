// Clamps x between min and max, inclusive
export function clamp(x, min, max) {
  return x > max ? max : (x < min ? min : x);
}

// Takes x modulo y with optional offset
export function modulo(x, y, offset=0) {
  return ((((x - offset) % y ) + y ) % y) + offset;
}
