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
    // public variable
    this.vectorDataLoaded = false;

    // private variables with corresponding public setters
    this._data = options.data;
    this._colormap = options.colormap;
    this._domain = options.domain;

    // private variables (no setters)
    this._gl = gl;
    this._gl.enable(gl.BLEND);
    this._gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    this._gl.getExtension('OES_texture_float');

    this._programs = this._createPrograms();
    this._buffers = this._createBuffers();
    this._textures = this._createTextures();
    this._framebuffers = this._createFramebuffers();

    this._mapDataToColors();
    this._dataNeedsRecolor = false;

    (async () => {
      this._buffers.vectors = await this._createVectorBuffers();
      this.vectorDataLoaded = true;
    })();
  }

  set data(d) {
    let oldWidth = this._data.width;
    let oldHeight = this._data.width;
    this._data = d;

    if (oldWidth !== this._data.width || oldHeight !== this._data.height) {
      this._textures.gridded = this._createGriddedTexture();
    }
    this._textures.data = this._createDataTexture();
    this._framebuffers = this._createFramebuffers();
    this._dataNeedsRecolor = true;
  }

  set colormap(c) {
    this._colormap = c;
    this._textures.colormap = this._createColormapTexture();
    this._dataNeedsRecolor = true;
  }

  set domain(d) {
    this._domain = d;
    this._dataNeedsRecolor = true;
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

  drawCoastlines(sharedUniforms) {
    if (!this._buffers.vectors.coastlines) {
      return;
    }
    glDraw(this._gl, this._programs.vector, this._buffers.vectors.coastlines, {
      u_color: [1, 1, 1, 1], // bold
      ...sharedUniforms,
    }, this._gl.LINES);
  }

  drawLakes(sharedUniforms) {
    if (!this._buffers.vectors.lakes) {
      return;
    }
    glDraw(this._gl, this._programs.vector, this._buffers.vectors.lakes, {
      u_color: [1, 1, 1, 1], // bold
      ...sharedUniforms,
    }, this._gl.LINES);
  }

  drawRivers(sharedUniforms) {
    if (!this._buffers.vectors.rivers) {
      return;
    }
    glDraw(this._gl, this._programs.vector, this._buffers.vectors.rivers, {
      u_color: [1, 1, 1, 0.5], // light
      ...sharedUniforms,
    }, this._gl.LINES);
  }

  drawGraticules(sharedUniforms) {
    if (!this._buffers.vectors.graticules) {
      return;
    }
    glDraw(this._gl, this._programs.vector, this._buffers.vectors.graticules, {
      u_color: [1, 1, 1, 0.1], // lighter
      ...sharedUniforms,
    }, this._gl.LINES);
  }

  _createPrograms() {
    return {
      gridded: twgl.createProgramInfo(this._gl, [griddedVert, griddedFrag]),
      vector: twgl.createProgramInfo(this._gl, [vectorVert, vectorFrag]),
      colormap: twgl.createProgramInfo(this._gl, [griddedVert, colormapFrag]),
    };
  }

  _createBuffers() {
    let gridded = twgl.createBufferInfoFromArrays(this._gl, griddedArrays);
    return {
      gridded: gridded,
      vectors: {}, // loaded asynchronously later
      colormap: gridded,
    };
  }

  async _createVectorBuffers() {
    let data = await fetch('/data/topology.json').then(res => res.json());

    // update the following if sources for topology.json change
    let coastlineObj = data.objects.ne_50m_coastline;
    let lakesObj = data.objects.ne_50m_lakes;
    let riversObj = data.objects.ne_50m_rivers_lake_centerlines;
    let graticulesObj = data.objects.ne_50m_graticules_10;

    return {
      coastlines: createBufferInfoFromTopojson(this._gl, data, coastlineObj),
      lakes: createBufferInfoFromTopojson(this._gl, data, lakesObj),
      rivers: createBufferInfoFromTopojson(this._gl, data, riversObj),
      graticules: createBufferInfoFromTopojson(this._gl, data, graticulesObj),
    };
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
    return twgl.createTexture(this._gl, {
      src: this._data.float32Array,
      type: this._gl.FLOAT,
      format: this._gl.ALPHA,
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

  // using the selected colormap and domain, draw a texture that represents the
  // (gridded) data
  _mapDataToColors() {
    // switch rendering destination to our framebuffer
    twgl.bindFramebufferInfo(this._gl, this._framebuffers.gridded);

    glDraw(this._gl, this._programs.colormap, this._buffers.colormap, {
      u_data: this._textures.data,
      u_colormap: this._textures.colormap,
      u_colormapN: this._colormap.lut.length,
      u_domain: this._domain,
    });

    // switch rendering destination back to canvas
    twgl.bindFramebufferInfo(this._gl, null);
  }
}

function createBufferInfoFromTopojson(gl, data, object) {
  let mesh = topojson.mesh(data, object);
  let currentIndex = 0;
  let indices = [];

  for (let i = 0; i < mesh.coordinates.length; i++) {
    let lastIndexOfLineSegment = currentIndex + mesh.coordinates[i].length - 1;

    for(; currentIndex < lastIndexOfLineSegment; currentIndex++) {
      indices.push(currentIndex);
      indices.push(currentIndex + 1);
    }
    currentIndex = lastIndexOfLineSegment + 1;
  }

  let arrays = {
    a_lonLat: {
      numComponents: 2,
      data: mesh.coordinates.flat(2),
    },
    indices: indices,
  };

  return twgl.createBufferInfoFromArrays(gl, arrays);
}
