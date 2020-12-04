import { color } from 'd3-color';
import * as d3 from 'd3-scale-chromatic';

import {
  thermal,
  ice,
} from './cmocean.js';

import {
  precip_6h,
  total_cloud_water,
  total_precipitable_water,
  mean_sea_level_pressure,
  so2_mass,
  carbon_monoxide_surface,
  dust_mass,
  total_column_ozone,
  currents,
} from './fever.js';

// Enums for colormaps
//
// lut stands for LookUp Table, used to construct a texture

let colormaps = {
  /////////////////////////////////////////////////////////////////////////////
  // FEVer original colormaps
  /////////////////////////////////////////////////////////////////////////////
  PRECIP_6H:{
    name: 'precip_6h',
    //lut: precip_6h,
    get lut() { return convert(precip_6h) }
  },

  TOTAL_CLOUD:{
    name: 'total_cloud_water',
    get lut(){ return convert(total_cloud_water) }
  },

  TOTAL_PRECIP:{
    name: 'total_precipitable_water',
    get lut(){ return convert(total_precipitable_water) }
  },

  MEAN_SEA_LEVEL_PRESSURE:{
    name: 'mean_sea_level_pressure',
    get lut() { return convert(mean_sea_level_pressure) }
  },

  SO2_MASS:{
    name: 'sulfur_dioxide_mass',
    get lut() { return convert(so2_mass) }
  },

  CO_SURFACE:{
    name: 'carbon_monoxide_surface',
    get lut() { return convert(carbon_monoxide_surface) }
  },

  DUST_MASS:{
    name: 'dust_mass',
    get lut() { return convert(dust_mass) }
  },

  COLUMN_OZONE:{
    name:'total_column_ozone',
    get lut() { return convert(total_column_ozone) }
  },

  CURRENTS:{
    name: 'currents',
    get lut() { return convert(currents) }
  },
  /////////////////////////////////////////////////////////////////////////////
  // cmocean colormaps
  /////////////////////////////////////////////////////////////////////////////
  THERMAL: {
    name: 'thermal',
    lut: thermal,
  },
  ICE: {
    name: 'ice',
    lut: ice,
  },
  /////////////////////////////////////////////////////////////////////////////
  // Diverging
  /////////////////////////////////////////////////////////////////////////////
  BR_BG: {
    name: 'BrBG',
    get lut() { return lutFromD3Scheme(d3.schemeBrBG, 11) }
  },
  PR_GN: {
    name: 'PRGn',
    get lut() { return lutFromD3Scheme(d3.schemePRGn, 11) }
  },
  PI_YG: {
    name: 'PiYG',
    get lut() { return lutFromD3Scheme(d3.schemePiYG, 11) }
  },
  PU_OR: {
    name: 'PuOr',
    get lut() { return lutFromD3Scheme(d3.schemePuOr, 11) }
  },
  RD_BU: {
    name: 'RdBu',
    get lut() { return lutFromD3Scheme(d3.schemeRdBu, 11) }
  },
  RD_GY: {
    name: 'RdGy',
    get lut() { return lutFromD3Scheme(d3.schemeRdGy, 11) }
  },
  RD_YL_BU: {
    name: 'RdYlBu',
    get lut() { return lutFromD3Scheme(d3.schemeRdYlBu, 11) }
  },
  RD_YL_GN: {
    name: 'RdYlGn',
    get lut() { return lutFromD3Scheme(d3.schemeRdYlGn, 11) }
  },
  SPECTRAL: {
    name: 'Spectral',
    get lut() { return lutFromD3Scheme(d3.schemeSpectral, 11) }
  },
  /////////////////////////////////////////////////////////////////////////////
  // Sequential (Single-Hue)
  /////////////////////////////////////////////////////////////////////////////
  BLUES: {
    name: 'blues',
    get lut() { return lutFromD3Scheme(d3.schemeBlues, 9) }
  },
  GREENS: {
    name: 'greens',
    get lut() { return lutFromD3Scheme(d3.schemeGreens, 9) }
  },
  GREYS: {
    name: 'greys',
    get lut() { return lutFromD3Scheme(d3.schemeGreys, 9) }
  },
  ORANGES: {
    name: 'oranges',
    get lut() { return lutFromD3Scheme(d3.schemeOranges, 9) }
  },
  PURPLES: {
    name: 'purples',
    get lut() { return lutFromD3Scheme(d3.schemePurples, 9) }
  },
  REDS: {
    name: 'reds',
    get lut() { return lutFromD3Scheme(d3.schemeReds, 9) }
  },
  /////////////////////////////////////////////////////////////////////////////
  // Sequential (Multi-Hue)
  /////////////////////////////////////////////////////////////////////////////
  TURBO: {
    name: 'turbo',
    get lut() { return lutFromD3(d3.interpolateTurbo) }
  },
  VIRIDIS: {
    name: 'viridis',
    get lut() { return lutFromD3(d3.interpolateViridis) }
  },
  INFERNO: {
    name: 'inferno',
    get lut() { return lutFromD3(d3.interpolateInferno) }
  },
  MAGMA: {
    name: 'magma',
    get lut() { return lutFromD3(d3.interpolateMagma) }
  },
  PLASMA: {
    name: 'plasma',
    get lut() { return lutFromD3(d3.interpolatePlasma) }
  },
  CIVIDIS: {
    name: 'cividis',
    get lut() { return lutFromD3(d3.interpolateCividis) }
  },
  WARM: {
    name: 'warm',
    get lut() { return lutFromD3(d3.interpolateWarm) }
  },
  COOL: {
    name: 'cool',
    get lut() { return lutFromD3(d3.interpolateCool) }
  },
  CUBEHELIX_DEFAULT: {
    name: 'cubehelix default',
    get lut() { return lutFromD3(d3.interpolateCubehelixDefault) }
  },
  BU_GN: {
    name: 'BuGn',
    get lut() { return lutFromD3Scheme(d3.schemeBuGn, 9) }
  },
  BU_PU: {
    name: 'BuPu',
    get lut() { return lutFromD3Scheme(d3.schemeBuPu, 9) }
  },
  GN_BU: {
    name: 'GnBu',
    get lut() { return lutFromD3Scheme(d3.schemeGnBu, 9) }
  },
  OR_RD: {
    name: 'OrRd',
    get lut() { return lutFromD3Scheme(d3.schemeOrRd, 9) }
  },
  PU_BU_GN: {
    name: 'PuBuGn',
    get lut() { return lutFromD3Scheme(d3.schemePuBuGn, 9) }
  },
  PU_RD: {
    name: 'PuRd',
    get lut() { return lutFromD3Scheme(d3.schemePuRd, 9) }
  },
  RD_PU: {
    name: 'RdPu',
    get lut() { return lutFromD3Scheme(d3.schemeRdPu, 9) }
  },
  YL_GN_BU: {
    name: 'YlGnBu',
    get lut() { return lutFromD3Scheme(d3.schemeYlGnBu, 9) }
  },
  YL_GN: {
    name: 'YlGn',
    get lut() { return lutFromD3Scheme(d3.schemeYlGn, 9) }
  },
  YL_OR_BR: {
    name: 'YlOrBr',
    get lut() { return lutFromD3Scheme(d3.schemeYlOrBr, 9) }
  },
  YL_OR_RD: {
    name: 'YlOrRd',
    get lut() { return lutFromD3Scheme(d3.schemeYlOrRd, 9) }
  },
  /////////////////////////////////////////////////////////////////////////////
  // Cyclical
  /////////////////////////////////////////////////////////////////////////////
  RAINBOW: {
    name: 'rainbow',
    get lut() { return lutFromD3(d3.interpolateRainbow) }
  },
  SINEBOW: {
    name: 'sinebow',
    get lut() { return lutFromD3(d3.interpolateSinebow) }
  },
};

for (let prop in colormaps) {
  let colormap = colormaps[prop];

  colormaps[prop + '_REVERSED'] = {
    name: colormap.name + ' (reversed)',
    get lut() {
      let flippedLut = colormap.lut.slice();
      flippedLut.reverse();
      return flippedLut;
    }
  };
}

export default Object.freeze(colormaps);

function convert(oldArr) {
  return oldArr.map(color => color.map(x => x / 255));
}

function lutFromD3(interpolationFunction) {
  return Array.from({ length: 256 }, (_, i) => {
    let c = color(interpolationFunction(i / 255));
    return [c.r, c.g, c.b].map(x => x / 255);
  });
}

function lutFromD3Scheme(scheme, kmax) {
  return scheme[kmax].map(hex => {
    let c = color(hex);
    return [c.r, c.g, c.b].map(x => x / 255);
  });
}
