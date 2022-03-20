export const name = `geopotential height at surface`;

export const metadata = {
  unit: 'km',
  originalUnit: 'km',
  domain: [0, 32],
  colormap: 'TURBO',
};

export const grib2_options = {
  match: ':HGT:surface',
  factor: 1e-3,
};
