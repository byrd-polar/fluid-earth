export const name = 'total ozone';

export const metadata = {
  unit: 'DU',
  originalUnit: 'DU',
  domain: [200, 600],
  colormap: 'VIRIDIS',
};

export const grib2_options = {
  match: ':TOZNE:entire atmosphere',
};
