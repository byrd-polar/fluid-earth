export const name = 'wind at 300 mb';

export { metadata } from './gfs-wind-10-m.js';

export const grib2_options = {
  match: ':(U|V)GRD:300 mb',
  limit: 2,
};
