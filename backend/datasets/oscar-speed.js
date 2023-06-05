export const name = '[v1] ocean surface currents speed';

export const metadata = {
  unit: 'm/s',
  originalUnit: 'm/s',
  domain: [0.0, 2.5],
  colormap: 'BLUES_REVERSED',
};

export { netcdf_speed as convert } from '../file-conversions.js';
