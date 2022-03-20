export const name = `temperature at 10 mb`;

export { metadata } from './gfs-temperature-2-m.js';

export const grib2_options = {
  match: ':TMP:10 mb',
};
