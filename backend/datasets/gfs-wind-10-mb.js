export const name = 'wind at 10 mb';

export { metadata } from './gfs-wind-10-m.js';

export const grib2_options = {
  match: ':(U|V)GRD:10 mb',
  limit: 2,
};
