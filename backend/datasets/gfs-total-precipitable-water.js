export const name = 'total precipitable water';

export const metadata = {
  unit: 'kg/m^2',
  originalUnit: 'kg/m^2',
  domain: [0, 70],
  colormap: 'MAKO_REVERSED',
};

export const grib2_options = {
  match: ':PWAT:entire atmosphere',
};
