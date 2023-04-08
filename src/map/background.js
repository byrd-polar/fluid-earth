import * as twgl from 'twgl.js';
import * as topojson from 'topojson-client';

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
    this._gl.enable(gl.BLEND);
    this._gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    this._maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    this._dataTextureDimensions = getDataTextureDimensions(
      this._data, this._maxTextureSize);

    this._programs = this._createPrograms();
    this._buffers = this._createBuffers(options.vectorData);
    this._textures = this._createTextures();
    this._framebuffers = this._createFramebuffers();

    this._mapDataToColors();
    this._dataNeedsRecolor = false;
  }

  set data(d) {
    this._data = d;

    this._textures.gridded.forEach(t => this._gl.deleteTexture(t));
    this._textures.data.forEach(t => this._gl.deleteTexture(t));
    this._gl.deleteFramebuffer(this._framebuffers.gridded.framebuffer);

    this._dataTextureDimensions = getDataTextureDimensions(
      this._data, this._maxTextureSize);

    this._textures.gridded = this._createGriddedTextures();
    this._textures.data = this._createDataTextures();
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
    Object.values(this._buffers.vectors).forEach(vector =>  {
      this._gl.deleteBuffer(vector.indices);
    });
    this._buffers.vectors = this._createVectorBuffers(d);
  }

  drawGriddedData(sharedUniforms) {
    if (this._dataNeedsRecolor) {
      this._mapDataToColors();
      this._dataNeedsRecolor = false;
    }
    for (let i = 0; i < this._textures.gridded.length / 16; i++) {
      let textures = Object.fromEntries(
        this._textures.gridded
          .slice(i * 16, i * 16 + 16)
          .map((t, j) => [`u_texture${j}`, t])
      );
      glDraw(this._gl, this._programs.gridded, this._buffers.gridded, {
        ...textures,
        u_gridWidth: this._data.width,
        u_gridHeight: this._data.height,
        u_maxTextureSize: this._maxTextureSize,
        u_textureBatchNumber: i,
        ...sharedUniforms,
      });
    }
  }

  drawVectorData(sharedUniforms, colors) {
    for (const [name, color] of Object.entries(colors)) {
      let bufferInfo = this._buffers.vectors[name];
      if (bufferInfo !== undefined) {
        glDraw(this._gl, this._programs.vector, bufferInfo, {
          u_color: color.map((v, i) => i === 3 ? v : v / 255),
          ...sharedUniforms,
        }, this._gl.LINES);
      }
    }
  }

  _createPrograms() {
    return {
      gridded: twgl.createProgramInfo(this._gl, [griddedVert, griddedFrag]),
      vector: twgl.createProgramInfo(this._gl, [vectorVert, vectorFrag]),
      colormap: twgl.createProgramInfo(this._gl, [griddedVert, colormapFrag]),
    };
  }

  _createBuffers(vectorData) {
    let gridded = twgl.createBufferInfoFromArrays(this._gl, griddedArrays);
    return {
      gridded: gridded,
      vectors: this._createVectorBuffers(vectorData),
      colormap: gridded,
    };
  }

  _createVectorBuffers(data) {
    let buffers = {};

    for (const [name, obj] of Object.entries(data.objects)) {
      buffers[name] = createBufferInfoFromTopojson(this._gl, data, obj);
    }
    return buffers;
  }

  _createTextures() {
    return {
      gridded: this._createGriddedTextures(),
      data: this._createDataTextures(),
      colormap: this._createColormapTexture(),
    };
  }

  _createGriddedTextures() {
    let options = {
      mag: this._gl.NEAREST, // show zoomed in data as individual pixels
      min: this._gl.LINEAR,
      auto: false,
    };

    return this._dataTextureDimensions.map(({ width, height }) => {
      return twgl.createTexture(this._gl, { width, height, ...options });
    });
  }

  _createDataTextures() {
    let { floatArray } = this._data;
    let halfFloat = floatArray.constructor.name !== 'Float32Array';
    let options = {
      type:           halfFloat ? this._gl.HALF_FLOAT : this._gl.FLOAT,
      internalFormat: halfFloat ? this._gl.R16F : this._gl.R32F,
      format: this._gl.RED,
      minMag: this._gl.NEAREST, // don't filter between data points
    };

    let offset = 0;
    floatArray = halfFloat ? new Uint16Array(floatArray.buffer): floatArray;

    return this._dataTextureDimensions.map(({ width, height }) => {
      let start = offset;
      let end = start + (width * height);
      offset = end;

      let src;
      if (end <= floatArray.length) {
        src = floatArray.subarray(start, end);
      } else {
        src = new (halfFloat ? Uint16Array : Float32Array)(end - start);
        src.set(floatArray.subarray(start, end));
      }

      return twgl.createTexture(this._gl, { src, width, height, ...options});
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
      gridded: this._dataTextureDimensions.map(({ width, height}, i) => {
        return twgl.createFramebufferInfo(
          this._gl,
          [{ attachment: this._textures.gridded[i] }],
          width,
          height,
        );
      }),
    };
  }

  // draw a texture that represents the (gridded) data using the selected
  // colormap, domain, and scale type
  _mapDataToColors() {
    for (let i = 0; i < this._textures.data.length; i++) {
      // switch rendering destination to our framebuffer
      twgl.bindFramebufferInfo(this._gl, this._framebuffers.gridded[i]);

      glDraw(this._gl, this._programs.colormap, this._buffers.colormap, {
        u_data: this._textures.data[i],
        u_colormap: this._textures.colormap,
        u_colormapN: this._colormap.lut.length,
        u_domain: this._domain,
        u_scale: this._scale === 'log' ? 1 : 0,
        u_baseColor: this._baseColor.map((v, i) => i === 3 ? v : v / 255),
      });
    }

    // switch rendering destination back to canvas
    twgl.bindFramebufferInfo(this._gl, null);
  }
}

function getDataTextureDimensions(data, max) {
  if (data.width <= max && data.height <= max) {
    return [{ width: data.width, height: data.height }];
  }

  let pixelCount = data.width * data.height;
  let maxPixelsPerTexture = Math.pow(max, 2);
  let length = Math.floor(pixelCount / maxPixelsPerTexture);

  let lastHeight = Math.ceil((pixelCount % maxPixelsPerTexture) / max) + 1;

  return [
    ...Array(length).fill({ width: max, height: max }),
    { width: max, height: lastHeight },
  ];
}

function createBufferInfoFromTopojson(gl, data, object) {
  let mesh = topojson.mesh(data, object);
  let points = [];

  for (const line of mesh.coordinates) {
    for (let i = 0; i < line.length - 1; i++) {
      points.push(...line[i], 0, ...line[i + 1], 1);
    }
  }
  return twgl.createBufferInfoFromArrays(gl, {
    a_lonLat: { numComponents: 3, data: points },
  });
}
