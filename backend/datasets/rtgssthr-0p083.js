export const metadataBase = {
  name: 'sea surface temperature',
  unit: 'tempC',
  originalUnit: 'tempK',
  domain: [273.15 - 1.8, 273.15 + 31.5],
  colormap: 'THERMAL',
  bytesPerFile: 18662400,
  width: 4320,
  height: 2160,
  intervalInHours: 24,
  projection: 'RTGSSTHR',
};


export function update(dataset, outputDirectory) {

  return {
    start: dataset.start,
    end: datetime,
    lastForecast: datetime,
  }
};
