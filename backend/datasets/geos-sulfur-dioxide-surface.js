export const name = 'sulfur dioxide at surface';

export const metadata = {
  unit: 'μg/m^3',
  originalUnit: 'μg/m^3',
  domain: [0.00001, 100],
  scale: 'log',
  colormap: 'CIVIDIS',
};

export const netcdf_options = {
  variables: 'SO2SMASS',
  factor: 1e9,
};
