import viridis from './viridis.js';
import magma from './magma.js';

// Enums for colormaps
// note: 'lot' stands for LookUp Table

export default Object.freeze({
  VIRIDIS: {
    id: Symbol('viridis'),
    lot: viridis,
  },
  MAGMA: {
    id: Symbol('magma'),
    lot: magma,
  },
});
