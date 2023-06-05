export const name = '[v1] ocean surface currents';

export const metadata = {
  particleLifetime: 10000,
  particleCount: 300000,
  particleDisplay: {
    size: 0.5,
    rate: 150000,
    opacity: 0.3,
    opacitySpeedDecay: 0.005,
    fade: 0.98
  },
};

export { netcdf as convert } from '../file-conversions.js';
