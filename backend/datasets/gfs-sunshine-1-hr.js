export const name = 'sunshine in previous hour';

export const metadata = {
  unit: 'min',
  originalUnit: 's',
  domain: [0, 3600],
  colormap: 'SUNSHINE',
};

export const grib2_options = {
  match: ':SUNSD:surface',
};

export const accumulation = {
  reset: 6,
};
