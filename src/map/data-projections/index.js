// Enums for data projections, specific for each dataset
//
// ids are passed as uniforms to the gridded and step shaders
//
// functions return an array index and are attached to griddedData and
// particleData objects in App.svelte to get value of arbitrary lonLat points

export default Object.freeze({
  GFS: {
    id: 0,
    function: (data, lonLat) => {
      const wRes = data.width / 360;
      const hRes = (data.height - 1) / 180;

      const col = Math.round((lonLat[0] + 360) * wRes) % data.width;
      const row = Math.round((lonLat[1] + 90) * hRes);

      return row * data.width + col;
    },
  },
  RTGSSTHR: {
    id: 1,
    function: (data, lonLat) => {
      const wRes = data.width / 360;
      const hRes = data.height / 180;

      const col = Math.floor((lonLat[0] + 360) * wRes) % data.width;
      const row =
        Math.min(Math.floor((lonLat[1] + 90) * hRes), data.height - 1);

      return row * data.width + col;
    },
  },
  OSCAR: {
    id: 2,
    function: (data, lonLat) => {
      const wRes = data.width / 360;
      const hRes = (data.height - 1) / 180;

      const col = Math.round((lonLat[0] + 360) * wRes) % data.width;
      const row = Math.round((lonLat[1] + 90) * hRes);

      return row * data.width + col;
    },
  },
});

// given a griddedData object and a lonLat, return the value at that point
export function singleArrayDataGet(griddedData, lonLat) {
  const index = griddedData.projection.function(griddedData, lonLat);
  const value = griddedData.floatArray[index];
  return value === Number.NEGATIVE_INFINITY ? NaN : value;
}

// given a particleData object and a lonLat, return the values at that point
export function pairedArrayDataGet(particleData, lonLat) {
  const index = particleData.projection.function(particleData, lonLat);
  const values = [
    particleData.uVelocities[index],
    particleData.vVelocities[index],
  ];
  return values.map(v => v === Number.NEGATIVE_INFINITY ? NaN : v);
}
