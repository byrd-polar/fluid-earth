export const name = `temperature at 300 mb`;

export { metadata } from './gfs-temperature-2-m.js';

export const grib2_options = {
  match: ':TMP:300 mb',
};
