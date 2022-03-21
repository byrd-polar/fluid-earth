export const name = 'total cloud water';

export const metadata = {
  unit: 'kg/m^2',
  originalUnit: 'kg/m^2',
  domain: [0.0, 1.0],
  colormap: 'BLUES_REVERSED',
};

export const grib2_options = {
  match: ':CWAT:entire atmosphere',
};
