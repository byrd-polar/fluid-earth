export const name = 'average precipitation per day anomaly';

export const metadata = {
  unit: 'mm',
  originalUnit: 'm',
  domain: [-0.02, 0.02],
  colormap: 'ICEFIRE_REVERSED',
};

export { variable } from './era5monthly-precipitation-1-day.js';

export const anomaly = true;
