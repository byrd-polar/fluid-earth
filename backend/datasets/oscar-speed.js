export const name = 'ocean surface currents speed';

export const unique_metadata = {
  unit: 'm/s',
  originalUnit: 'm/s',
  domain: [0.0, 2.5],
  colormap: 'BLUES_REVERSED',
  bytesPerFile: 1155362,
};

export { netcdf_speed as convert } from '../file-conversions.js';
