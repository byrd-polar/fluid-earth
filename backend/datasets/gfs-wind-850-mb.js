export const name = 'wind at 850 mb';

export { metadata } from './gfs-wind-10-m.js';

export const grib2_options = {
  match: ':(U|V)GRD:850 mb',
  limit: 2,
};
