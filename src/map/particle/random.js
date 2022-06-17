import { randlon, randlat } from '../../math.js';

export function randomLongitudeArray(length) {
  let random = new Float32Array(length);

  for (let i = 0; i < random.length; i++) {
    random[i] = randlon();
  }

  return random;
}

export function randomLatitudeArray(length) {
  let random = new Float32Array(length);

  for (let i = 0; i < random.length; i++) {
    random[i] = randlat();
  }

  return random;
}

export function randomArray(max, length) {
  let random = new Float32Array(length);

  for (let i = 0; i < random.length; i++) {
    random[i] = max * Math.random();
  }

  return random;
}
