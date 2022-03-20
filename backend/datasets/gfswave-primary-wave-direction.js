export const name = 'primary wave direction (from)';

export const metadata = {
  unit: 'deg',
  originalUnit: 'deg',
  domain: [0, 360],
  colormap: 'RAINBOW',
};

export const grib2_options = {
  match: ':DIRPW:surface',
};
