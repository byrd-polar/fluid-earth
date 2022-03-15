export const name = 'dust at surface';

export const metadata = {
  unit: 'μg/m^3',
  originalUnit: 'μg/m^3',
  domain: [0, 900],
  colormap: 'YL_OR_BR_REVERSED',
};

export const netcdf_options = {
  variables: 'DUSMASS',
  factor: 1e9,
};
