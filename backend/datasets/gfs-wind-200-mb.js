export const name = 'wind at 200 mb';

export { metadata } from './gfs-wind-10-m.js';

export const grib2_options = {
  match: ':(U|V)GRD:200 mb',
  limit: 2,
};
