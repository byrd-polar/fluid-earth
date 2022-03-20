export const name = `geopotential height at 300 mb`;

export { metadata } from './gfs-geopotential-height-surface.js';

export const grib2_options = {
  match: ':HGT:300 mb',
  factor: 1e-3,
};
