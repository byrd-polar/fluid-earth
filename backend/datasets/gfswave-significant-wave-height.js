export const name = 'significant wave height';

export const metadata = {
  unit: 'm',
  originalUnit: 'm',
  domain: [0, 12],
  colormap: 'GN_BU_REVERSED',
};

export const grib2_options = {
  match: ':HTSGW:surface',
};
