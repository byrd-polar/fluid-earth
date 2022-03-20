export const name = `temperature at 2 m above ground`;

export const metadata = {
  unit: 'tempC',
  originalUnit: 'tempK',
  domain: [273.15 - 80, 273.15 + 55],
  colormap: 'MAGMA',
};

export const grib2_options = {
  match: ':TMP:2 m above ground',
};
