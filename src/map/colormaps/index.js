import viridis from './viridis.js';
import magma from './magma.js';

// Enums for colormaps
//
// lot stands for LookUp Table, used to construct a texture

export default Object.freeze({
  VIRIDIS: {
    name: 'viridis',
    lot: viridis,
  },
  MAGMA: {
    name: 'magma',
    lot: magma,
  },
});
