export const name = `geopotential height at 500 mb`;

export { metadata } from './gfs-geopotential-height-surface.js';

export const grib2_options = {
  match: ':HGT:500 mb',
  factor: 1e-3,
};
