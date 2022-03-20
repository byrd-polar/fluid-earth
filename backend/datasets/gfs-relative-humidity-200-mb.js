export const name = `relative humidity at 200 mb`;

export { metadata } from './gfs-relative-humidity-2-m.js';

export const grib2_options = {
  match: ':RH:200 mb',
};
