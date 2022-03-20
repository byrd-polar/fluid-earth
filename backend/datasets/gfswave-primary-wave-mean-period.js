export const name = 'primary wave mean period';

export const metadata = {
  unit: 's',
  originalUnit: 's',
  domain: [0, 22],
  colormap: 'PU_BU_GN',
};

export const grib2_options = {
  match: ':PERPW:surface',
};
