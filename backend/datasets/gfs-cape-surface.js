export const name = `convective available potential energy at surface`;

export const metadata = {
  unit: 'J/kg',
  originalUnit: 'J/kg',
  domain: [0, 5000],
  colormap: 'INFERNO',
};

export const grib2_options = {
  match: ':CAPE:surface',
};
