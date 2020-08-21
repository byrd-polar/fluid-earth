export function randomLongitudeArray(length) {
  let random = new Float32Array(length);

  for (let i = 0; i < random.length; i++) {
    random[i] = 360 * Math.random() - 180;
  }

  return random;
}

export function randomLatitudeArray(length) {
  let random = new Float32Array(length);

  for (let i = 0; i < random.length; i++) {
    random[i] = (180 / Math.PI) * Math.asin(2 * Math.random() - 1);
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
