// Functions to get data at specific points on the gridded data layer

export function dataPoint(
  griddedData, // a griddedData object
  lonLat, // a [longitude, latitude] array
) {
  let wRes = griddedData.width / 360;
  let col = Math.round((lonLat[0] + 360) * wRes) % griddedData.width;

  let hRes = (griddedData.height - 1) / 180
  let row = Math.round(-(lonLat[1] - 90) * hRes)

  let index = row * griddedData.width + col;

  return griddedData.floatArray[index];
}
