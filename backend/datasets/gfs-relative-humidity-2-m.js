export const name = `relative humidity at 2 m above ground`;

export const metadata = {
  unit: '%',
  originalUnit: '%',
  domain: [0, 100],
  colormap: 'CREST',
};

export const grib2_options = {
  match: ':RH:2 m above ground',
};
