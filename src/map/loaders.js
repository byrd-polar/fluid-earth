import * as twgl from 'twgl.js';
import * as topojson from 'topojson-client';

import griddedVertexShader from './gridded.vert';
import colormapFragmentShader from './colormap.frag';

import { griddedArrays } from './arrays.js';

export function createGriddedDataLoader(gl) {
  let programInfo = twgl.createProgramInfo(gl, [
    griddedVertexShader,
    colormapFragmentShader,
  ]);
  let bufferInfo = twgl.createBufferInfoFromArrays(gl, griddedArrays);

  let previousTextureInfo = {
    data: {},
    colormap: {},
  };
  let data;
  let dataTexture;
  let texture;
  let framebufferInfo = {};
  let colormapTexture;

  return async griddedTextureInfo => {
    // don't reallocate space if new data has the same dimensions as old
    if (previousTextureInfo.data.width !== griddedTextureInfo.data.width ||
      previousTextureInfo.data.height !== griddedTextureInfo.data.height) {

      // allocate space for actual texture, empty for now
      let textureOptions = {
        mag: gl.NEAREST, // show zoomed in data as individual pixels
        min: gl.LINEAR,
        width: griddedTextureInfo.data.width,
        height: griddedTextureInfo.data.height,
      };
      texture = twgl.createTexture(gl, textureOptions);

      gl.deleteFramebuffer(framebufferInfo.framebuffer);
      framebufferInfo = twgl.createFramebufferInfo(gl, [{
        attachment: texture,
        ...textureOptions,
      }], griddedTextureInfo.data.width, griddedTextureInfo.data.height);
    }

    // update data texture if data has changed
    if (previousTextureInfo.data !== griddedTextureInfo.data) {
      previousTextureInfo.data = griddedTextureInfo.data;

      let buffer = await fetch(griddedTextureInfo.data.path)
        .then(res => res.arrayBuffer());
      data = new Float32Array(buffer);

      // texture with float data that will be used as a data source to render to
      // actual texture
      gl.deleteTexture(dataTexture); // delete old texture
      dataTexture = twgl.createTexture(gl, {
        src: data,
        type: gl.FLOAT, // 32-bit floating data
        format: gl.ALPHA, // 1 channel per pixel
        minMag: gl.NEAREST, // linear filtering not available for float textures
        width: griddedTextureInfo.data.width,
        height: griddedTextureInfo.data.height,
      });
    }

    // update colormap texture if colormap has changed
    if (previousTextureInfo.colormap.name !==
      griddedTextureInfo.colormap.name) {
      previousTextureInfo.colormap = griddedTextureInfo.colormap;

      // colormap as a texture, will be interpolated in fragment shader
      gl.deleteTexture(colormapTexture);
      colormapTexture = twgl.createTexture(gl, {
        src: griddedTextureInfo.colormap.lot.flat().map(x => {
          return Math.round(x * 255);
        }),
        format: gl.RGB, // 3 channels per pixel
        minMag: gl.LINEAR, // don't use mipmaps
        height: 1,
        width: griddedTextureInfo.colormap.lot.length,
      });
    }

    // relying on Javascript's run-to-completion semantics to ensure the below
    // calls to the WegGL context (useProgram and bindFramebuffer) don't
    // interfere with the main animation loop

    // switch rendering destination to our empty texture
    twgl.bindFramebufferInfo(gl, framebufferInfo);

    // perform colormap interpolation on GPU and render them to our texture
    const uniforms = {
      u_data: dataTexture,
      u_colormap: colormapTexture,
      u_colormapN: griddedTextureInfo.colormap.lot.length,
      u_domain: griddedTextureInfo.domain,
    };

    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    twgl.setUniformsAndBindTextures(programInfo, uniforms);
    twgl.drawBufferInfo(gl, bufferInfo);

    // switch rendering destination back to canvas
    twgl.bindFramebufferInfo(gl, null);

    return texture;
  }
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
          return [1, 1, 1, 0.1]; // lighter
        } else {
          return [1, 1, 1, 1]; // bold
        }
      })(),
    }
  });
  return vectorBufferInfos;
}
