import viridis from './viridis.js';
import magma from './magma.js';

// Enums for colormaps
//
// lut stands for LookUp Table, used to construct a texture

export default Object.freeze({
  VIRIDIS: {
    name: 'viridis',
    lut: viridis,
  },
  MAGMA: {
    name: 'magma',
    lut: magma,
  },
});
