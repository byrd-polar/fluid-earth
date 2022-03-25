export const name = 'wind at 10 m above ground';

export const metadata = {
  particleLifetime: 2000,
  particleCount: 100000,
  particleDisplay: {
    size: 0.8,
    rate: 25000,
    opacity: 0.3,
    opacitySpeedDecay: 0.8,
    fade: 0.98,
  },
};

export const grib2_options = {
  match: ':(U|V)GRD:10 m above ground',
  limit: 2,
};
