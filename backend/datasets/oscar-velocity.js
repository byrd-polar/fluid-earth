export const name = 'ocean surface currents';

export const unique_metadata = {
  particleLifetime: 10000,
  particleCount: 300000,
  particleDisplay: {
    size: 0.5,
    rate: 150000,
    opacity: 0.3,
    opacitySpeedDecay: 0.005,
    fade: 0.98
  },
  bytesPerFile: 2310724,
};

export { netcdf as convert } from '../file-conversions.js';
