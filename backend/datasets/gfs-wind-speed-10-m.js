export const name = 'wind speed at 10 m above ground';

export const metadata = {
  unit: 'km/h',
  originalUnit: 'm/s',
  domain: [0, 100],
  colormap: 'TURBO',
};

export { grib2_options } from './gfs-wind-10-m.js';
export { grib2_speed as convert } from '../file-conversions.js';
