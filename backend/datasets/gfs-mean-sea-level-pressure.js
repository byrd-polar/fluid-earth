export const name = `mean sea level pressure`;

export const metadata = {
  unit: 'hPa',
  originalUnit: 'kPa',
  domain: [101.325 - 4, 101.325 + 4],
  colormap: 'ICEFIRE',
};

export const grib2_options = {
  match: ':PRMSL:mean sea level',
  factor: 1e-3,
};
