export const name = `geopotential height at 850 mb`;

export { metadata } from './gfs-geopotential-height-surface.js';

export const grib2_options = {
  match: ':HGT:850 mb',
  factor: 1e-3,
};
