import * as twgl from 'twgl.js';
import * as topojson from 'topojson-client';

import { modulo } from '../math.js';

import griddedVert from './gridded.vert';
import griddedFrag from './gridded.frag';
import vectorVert from './vector.vert';
import vectorFrag from './vector.frag';
import colormapFrag from './colormap.frag';

import { glDraw, griddedArrays } from './webgl.js';

export default class MapBackground {
  constructor(gl, options) {
    // private variables with corresponding public setters
    this._data = options.data;
    this._colormap = options.colormap;
    this._domain = options.domain;
    this._scale = options.scale;
    this._baseColor = options.baseColor;

    // private variables (no setters)
    this._gl = gl;
    this._webgl2 = options.webgl2;
    this._gl.enable(gl.BLEND);
    this._gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    this._ext = this._gl.getExtension('OES_texture_half_float');
    this._gl.getExtension('OES_texture_float');

    this._programs = this._createPrograms();
    this._buffers = this._createBuffers();
    this._textures = this._createTextures();
    this._framebuffers = this._createFramebuffers();

    this._meshes = this._createMeshes(options.vectorData);

    this._mapDataToColors();
    this._dataNeedsRecolor = false;
  }

  set data(d) {
    this._data = d;

    this._gl.deleteTexture(this._textures.gridded);
    this._gl.deleteTexture(this._textures.data);
    this._gl.deleteFramebuffer(this._framebuffers.gridded.framebuffer);

    this._textures.gridded = this._createGriddedTexture();
    this._textures.data = this._createDataTexture();
    this._framebuffers = this._createFramebuffers();
    this._dataNeedsRecolor = true;
  }

  set colormap(c) {
    this._colormap = c;
    this._gl.deleteTexture(this._textures.colormap);
    this._textures.colormap = this._createColormapTexture();
    this._dataNeedsRecolor = true;
  }

  set domain(d) {
    this._domain = d;
    this._dataNeedsRecolor = true;
  }

  set scale(s) {
    this._scale = s;
    this._dataNeedsRecolor = true;
  }

  set baseColor(b) {
    this._baseColor = b;
    this._dataNeedsRecolor = true;
  }

  set vectorData(d) {
    for (const mesh of Object.values(this._meshes)) {
      this._gl.deleteBuffer(mesh.bufferInfo.indices);
    }
    this._meshes = this._createMeshes(d);
  }

  drawGriddedData(sharedUniforms) {
    if (this._dataNeedsRecolor) {
      this._mapDataToColors();
      this._dataNeedsRecolor = false;
    }
    glDraw(this._gl, this._programs.gridded, this._buffers.gridded, {
      u_texture: this._textures.gridded,
      u_gridWidth: this._data.width,
      u_gridHeight: this._data.height,
      ...sharedUniforms,
    });
  }

  drawVectorData(sharedUniforms, colors) {
    for (const [name, color] of Object.entries(colors)) {
      let mesh = this._meshes[name];
      if (!mesh) continue;

      // cut lines crossing the anti-meridian if map projection is cylindrical
      let bufferInfo;
      if (sharedUniforms.u_translateY) {
        let filter = createAntimeridianFilter(sharedUniforms.u_lon0);
        bufferInfo = createBufferInfoFromMesh(this._gl, mesh, filter);
      } else {
        bufferInfo = mesh.bufferInfo;
      }

      glDraw(this._gl, this._programs.vector, bufferInfo, {
        u_color: color.map((v, i) => i === 3 ? v : v / 255),
        ...sharedUniforms,
      }, this._gl.LINES);

      if (sharedUniforms.u_translateY) {
        this._gl.deleteBuffer(bufferInfo.indices);
      }
    }
  }

  _createPrograms() {
    // switch from using the ALPHA channel to the RED channel if using webgl2,
    // as those are the only single-channel float textures supported by webgl
    // and webgl2 respectively
    let colormapFrag2 = this._webgl2 ?
      colormapFrag.replace(/\)\.a;/g, ').r;') :
      colormapFrag;
    return {
      gridded: twgl.createProgramInfo(this._gl, [griddedVert, griddedFrag]),
      vector: twgl.createProgramInfo(this._gl, [vectorVert, vectorFrag]),
      colormap: twgl.createProgramInfo(this._gl, [griddedVert, colormapFrag2]),
    };
  }

  _createBuffers() {
    let gridded = twgl.createBufferInfoFromArrays(this._gl, griddedArrays);
    return {
      gridded: gridded,
      colormap: gridded,
    };
  }

  _createMeshes(data) {
    let meshes = {};
    for (const [name, object] of Object.entries(data.objects)) {
      let coordinates = topojson.mesh(data, object).coordinates;
      let mesh = {
        coordinates,
        data: coordinates.flat(2),
      };
      mesh.bufferInfo = createBufferInfoFromMesh(this._gl, mesh);
      meshes[name] = mesh;
    }
    return meshes;
  }

  _createTextures() {
    return {
      gridded: this._createGriddedTexture(),
      data: this._createDataTexture(),
      colormap: this._createColormapTexture(),
    };
  }

  _createGriddedTexture() {
    return twgl.createTexture(this._gl, {
      mag: this._gl.NEAREST, // show zoomed in data as individual pixels
      min: this._gl.LINEAR,
      width: this._data.width,
      height: this._data.height,
    });
  }

  _createDataTexture() {
    let src, type, internalFormat;

    if (this._data.floatArray.constructor.name !== 'Float32Array') {
      src = new Uint16Array(this._data.floatArray.buffer);
      type = this._webgl2 ? this._gl.HALF_FLOAT : this._ext.HALF_FLOAT_OES;
      internalFormat = this._webgl2 ? this._gl.R16F : this._gl.ALPHA;
    } else {
      src = this._data.floatArray;
      type = this._gl.FLOAT;
      internalFormat = this._webgl2 ? this._gl.R32F : this._gl.ALPHA;
    }

    return twgl.createTexture(this._gl, {
      src,
      type,
      format: this._webgl2 ? this._gl.RED : this._gl.ALPHA,
      internalFormat,
      minMag: this._gl.NEAREST, // don't filter between data points
      width: this._data.width,
      height: this._data.height,
    });
  }

  _createColormapTexture() {
    return twgl.createTexture(this._gl, {
      src: this._colormap.lut.flat(),
      format: this._gl.RGB,
      minMag: this._gl.LINEAR,
      width: this._colormap.lut.length,
      height: 1,
    });
  }

  _createFramebuffers() {
    return {
      gridded: twgl.createFramebufferInfo(
        this._gl,
        [{ attachment: this._textures.gridded }],
        this._data.width,
        this._data.height,
      ),
    };
  }

  // draw a texture that represents the (gridded) data using the selected
  // colormap, domain, and scale type
  _mapDataToColors() {
    // switch rendering destination to our framebuffer
    twgl.bindFramebufferInfo(this._gl, this._framebuffers.gridded);

    glDraw(this._gl, this._programs.colormap, this._buffers.colormap, {
      u_data: this._textures.data,
      u_colormap: this._textures.colormap,
      u_colormapN: this._colormap.lut.length,
      u_domain: this._domain,
      u_scale: this._scale === 'log' ? 1 : 0,
      u_baseColor: this._baseColor.map((v, i) => i === 3 ? v : v / 255),
    });

    // switch rendering destination back to canvas
    twgl.bindFramebufferInfo(this._gl, null);
  }
}

function createBufferInfoFromMesh(gl, mesh, filter=(() => true)) {
  let currentIndex = 0;
  let indices = [];
  let { coordinates } = mesh;

  for (let i = 0; i < coordinates.length; i++) {
    for (let j = 0; j < coordinates[i].length - 1; j++) {
      if (filter(coordinates[i][j], coordinates[i][j + 1])) {
        indices.push(currentIndex);
        indices.push(currentIndex + 1);
      }
      currentIndex++;
    }
    currentIndex++;
  }

  let arrays = {
    a_lonLat: {
      numComponents: 2,
      data: mesh.data,
    },
    indices,
  };

  return twgl.createBufferInfoFromArrays(gl, arrays);
}

const e = 1e-3;

function createAntimeridianFilter(meridian) {
  let x = modulo(meridian + 180, 360, 180);
  return (a, b) => {
    let lon1 = a[0] + 360;
    let lon2 = b[0] + 360;
    return (x-e > lon1 && x-e > lon2) || (x+e < lon1 && x+e < lon2);
  }
}
