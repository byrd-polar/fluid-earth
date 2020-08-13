// Enums for map projections
//
// ids are passed as uniforms to the gridded and vector shaders

export default Object.freeze({
  EQUIRECTANGULAR: {
    name: 'equirectangular',
    id: 0,
  },
  MERCATOR: {
    name: 'Mercator',
    id: 1,
  },
  EQUAL_EARTH: {
    name: 'Equal Earth',
    id: 2,
  },
  ORTHOGRAPHIC: {
    name: 'orthographic',
    id: 3,
  },
});
