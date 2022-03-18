export const parameter = 'PRMSL';
export const level = 'mean sea level';
export const factor = 1e-3;
export const name = `${level} pressure`;

export const metadata = {
  unit: 'hPa',
  originalUnit: 'kPa',
  domain: [101.325 - 4, 101.325 + 4],
  colormap: 'ICEFIRE',
};
