export const name = `geopotential height at 200 mb`;

export { metadata } from './gfs-geopotential-height-surface.js';

export const grib2_options = {
  match: ':HGT:200 mb',
  factor: 1e-3,
};
