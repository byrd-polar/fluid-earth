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

      // See GLSL implementation for details

      const a = 6378137.0;
      const e = 0.081819190842621494335;

      const P = Math.exp(e * Math.atanh(e * Math.sin(lonLat[1])));
      const x = (1 + Math.sin(lonLat[1])) / P;
      const y = (1 - Math.sin(lonLat[1])) * P;
      const cosChi = 2.0 * Math.cos(lonLat[1]) / (x + y);
      const sinChi = (x - y) / (x + y);

      const k71 = 1.9390295659155423;
      const m = k71 * a * cosChi / (1 + sinChi);

      let col = m * Math.sin(lonLat[0]);
      let row = -m * Math.cos(lonLat[0]);

      let res = data.width === 4485 ? 5 : 10;

      col = Math.floor((col + 10389109.8424841110) / 926.6254331383 / res);
      row = Math.floor(-(row - 9199572.4044017550) / 926.6254331383 / res);

      return row * data.width + col;
    },
  },
  OSCAR2: {
    id: 5,
    function: (data, lonLat) => {
      const hRes = data.height / 360;
      const wRes = (data.width + 1) / 180;

      const row = Math.round((lonLat[0] + 360) * hRes) % data.height;
      const col = Math.round((lonLat[1] + 90) * wRes - 1);

      return row * data.width + col;
    },
  },
});

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
