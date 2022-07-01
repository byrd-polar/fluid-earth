export const name = 'precipitation in previous hour';

export const metadata = {
  unit: 'mm',
  originalUnit: 'mm',
  domain: [0, 50],
  colormap: 'TURBO',
};

export const grib2_options = {
  match: ':APCP:surface:0-',
};

export const accumulation = {
  reset: Infinity,
};
