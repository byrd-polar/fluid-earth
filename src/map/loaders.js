import * as twgl from 'twgl.js';
import * as d3 from 'd3-scale-chromatic';
import { rgb } from 'd3-color';
import * as topojson from 'topojson-client';

// load the file of floats (gridded data) into texture uniform
export async function getGriddedData(gl, griddedTextureInfo) {
  let buffer = await fetch(griddedTextureInfo.data)
    .then(res => res.arrayBuffer());
  let data = new Float32Array(buffer);
  let texture = new Uint8Array(buffer);

  // The following loop is a major bottleneck for both initial page load and
  // switching between datasets (especially if we want to animate between
  // datasets). It is probably best improved by using
  // https://crates.io/crates/colorous compiled to WebAssembly w/ threads, but
  // this significantly increases code complexity, so we will keep this
  // suboptimal solution for now.
  for (let i = 0; i < data.length; i++) {
    let color = rgb(d3.interpolateViridis((data[i] - 240) / 80));
    texture[4*i+0] = color.r;
    texture[4*i+1] = color.g;
    texture[4*i+3] = color.b;
    texture[4*i+3] = 255;
  }

  return twgl.createTexture(gl, {
    src: texture,
    mag: gl.NEAREST, // show zoomed in data as individual pixels
    min: gl.LINEAR,
    width: griddedTextureInfo.width,
    height: griddedTextureInfo.height,
  });
}

// load the TopoJSON file into vectorBufferInfos
export async function getVectorData(gl) {
  let data = await fetch('/data/topology.json').then(res => res.json());
  let vectorBufferInfos = {};

  Object.keys(data.objects).forEach(obj => {
    let mesh = topojson.mesh(data, data.objects[obj]);
    let lineLengths = mesh.coordinates.map(points => points.length - 1);

    let currentIndex = 0;
    let indices = lineLengths.map(length => {
      // creates a subrange of indices with every index except the first and
      // last doubled, e.g. [0, 1, 1, 2, 2, 3], to represent one line
      let subRange = [
        currentIndex,
        ...Array.from(Array(length - 1).keys(), x => {
          let i = x + currentIndex + 1;
          return [i, i];
        }).flat(),
        currentIndex + length,
      ];
      currentIndex += length + 1;
      return subRange;
    }).flat();

    let arrays = {
      a_latLon: {
        numComponents: 2,
        data: mesh.coordinates.flat(2),
      },
      indices: indices,
    };

    vectorBufferInfos[obj] = {
      bufferInfo: twgl.createBufferInfoFromArrays(gl, arrays),
      color: (() => {
        if (obj === 'ne_50m_rivers_lake_centerlines') {
          return [1, 1, 1, 0.5]; // light
        } else if (obj === 'ne_50m_graticules_10') {
          return [1, 1, 1, 0.2]; // lighter
        } else {
          return [1, 1, 1, 1]; // bold
        }
      })(),
    }
  });
  return vectorBufferInfos;
}
