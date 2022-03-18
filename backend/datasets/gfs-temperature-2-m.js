export const parameter = 'TMP';
export const level = '2 m above ground';
export const name = `temperature at ${level}`;

export const metadata = {
  unit: 'tempC',
  originalUnit: 'tempK',
  domain: [273.15 - 80, 273.15 + 55],
  colormap: 'MAGMA',
};
