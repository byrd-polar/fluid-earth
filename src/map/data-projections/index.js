// Enums for data projections, specific for each dataset
//
// ids are passed as uniforms to the gridded and step shaders
//
// functions return an array index and are attached to griddedData and
// particleData objects in App.svelte to get value of arbitrary lonLat points

export default Object.freeze({
  ERA5: {
    id: -1,
    function: (data, lonLat) => {
      const wRes = data.width / 360;
      const hRes = (data.height - 1) / 180;

      const col = Math.round((lonLat[0] + 360) * wRes) % data.width;
      const row = (data.height - 1) - Math.round((lonLat[1] + 90) * hRes);

      return row * data.width + col;
    },
  },
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
      const wRes = (data.width - 1) / 400;
      const hRes = (data.height - 1) / 160;

      const col = Math.round((lonLat[0] + 340) * wRes) % (wRes * 360);
      const row = Math.round((-lonLat[1] + 80) * hRes);

      return row * data.width + col;
    },
  },
  GEOS: {
    id: 3,
    function: (data, lonLat) => {
      const wRes = data.width / 360;
      const hRes = (data.height - 1) / 180;

      const col = Math.round((lonLat[0] + 540) * wRes) % data.width;
      const row = Math.round((lonLat[1] + 90) * hRes);

      return row * data.width + col;
    },
  },
  PERMAFROST: {
    id: 4,
    function: (data, lonLat) => {
      lonLat = lonLat.map(v => v * Math.PI / 180);
      lonLat = rotateToNorthPole(lonLat);

      const cy = Math.cos(lonLat[1]);
      const k = 1 + Math.cos(lonLat[0]) * cy;

      const s = 0.598;
      const r = data.width / data.height;

      const x = s * cy * Math.sin(lonLat[0]) / k + 0.5;
      const y = -s * r * Math.sin(lonLat[1]) / k + 0.4695;

      const col = Math.round(x * data.width - 0.5) % data.width;
      const row = Math.round(y * data.height - 0.5);

      return row * data.width + col;
    },
  },
});

function rotateToNorthPole(lonLat) {
  let x = Math.cos(lonLat[0]) * Math.cos(lonLat[1]);
  let y = Math.sin(lonLat[0]) * Math.cos(lonLat[1]);
  let z = Math.sin(lonLat[1]);

  return [Math.atan2(y, z), Math.asin(-x)];
}

// given a griddedData object and a lonLat, return the value at that point
export function singleArrayDataGet(griddedData, lonLat) {
  const index = griddedData.projection.function(griddedData, lonLat);
  const value = griddedData.floatArray[index];
  const nan = value === Number.NEGATIVE_INFINITY || value === undefined;
  return nan ? NaN : value;
}

// given a particleData object and a lonLat, return the values at that point
export function pairedArrayDataGet(particleData, lonLat) {
  const index = particleData.projection.function(particleData, lonLat);
  const values = [
    particleData.uVelocities[index],
    particleData.vVelocities[index],
  ];
  return values.map(value => {
    const nan = value === Number.NEGATIVE_INFINITY || value === undefined;
    return nan ? NaN : value;
  });
}
