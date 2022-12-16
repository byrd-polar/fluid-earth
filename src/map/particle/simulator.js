import * as twgl from 'twgl.js';

import simVert from '../gridded.vert';
import simFrag from './step.frag';
import drawVert from './draw.vert';
import drawFrag from './draw.frag';
import textureVert from '../gridded.vert';
import textureFrag from './texture.frag';

import { glDraw, griddedArrays } from '../webgl.js';
import { randlon, randlat } from '../../math.js';

export default class ParticleSimulator {
  constructor(gl, options) {
    // private variables with corresponding public setters
    this._count = this._roundToSquareNumber(options.count);
    this._lifetime = options.lifetime;
    this._data = options.data;

    // private variables (no setters)
    this._gl = gl;
    this._gl.enable(gl.BLEND);
    this._linearFiltering = this._gl.getExtension('OES_texture_float_linear');

    this._programs = this._createPrograms();
    this._buffers = this._createBuffers();
    this._textures = this._createTextures();
    this._framebuffers = this._createFramebuffers();

    this._gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }

  set count(c) {
    this._count = this._roundToSquareNumber(c);

    this._gl.deleteBuffer(this._buffers.draw.indices);
    this._gl.deleteTexture(this._textures.simA);
    this._gl.deleteTexture(this._textures.simB);
    this._gl.deleteFramebuffer(this._framebuffers.simA.framebuffer);
    this._gl.deleteFramebuffer(this._framebuffers.simB.framebuffer);

    this._buffers.draw = this._createDrawBuffer();
    this._textures.simA = this._createSimATexture();
    this._textures.simB = this._createSimBTexture();
    this._framebuffers.simA = this._createSimFramebuffer(this._textures.simA);
    this._framebuffers.simB = this._createSimFramebuffer(this._textures.simB);
  }

  set lifetime(l) {
    this._lifetime = l;

    this._gl.deleteTexture(this._textures.simA);
    this._gl.deleteFramebuffer(this._framebuffers.simA.framebuffer);

    this._textures.simA = this._createSimATexture();
    this._framebuffers.simA = this._createSimFramebuffer(this._textures.simA);
  }

  set data(d) {
    this._data = d;

    this._gl.deleteTexture(this._textures.vectorFieldU);
    this._gl.deleteTexture(this._textures.vectorFieldV);

    this._textures.vectorFieldU =
      this._createVectorFieldTexture(this._data.uVelocities);
    this._textures.vectorFieldV =
      this._createVectorFieldTexture(this._data.vVelocities);
  }

  // using data in this._textures.simA, simulate and render to
  // this._framebuffers.simB (with this._textures.simB attached) the new
  // particle positions after timeDelta ms have passed
  //
  // timeDelta: milliseconds passed since last step
  // rate: how many times faster than real-world speed particles should move at
  step(sharedUniforms, timeDelta, rate) {
    // switch rendering destination to our framebuffer
    twgl.bindFramebufferInfo(this._gl, this._framebuffers.simB);

    this._gl.disable(this._gl.BLEND);
    glDraw(this._gl, this._programs.sim, this._buffers.sim, {
      u_particleData: this._textures.simA,
      u_vectorFieldU: this._textures.vectorFieldU,
      u_vectorFieldV: this._textures.vectorFieldV,
      u_random: this._textures.random,
      u_particleLifetime: this._lifetime,
      u_randLonLatOffsets: [Math.random(), Math.random()],
      u_gridWidth: this._data.width,
      u_gridHeight: this._data.height,
      u_timeDelta: timeDelta,
      u_rate: rate,
      ...sharedUniforms,
    });
    this._gl.enable(this._gl.BLEND);

    // switch rendering destination back to canvas
    twgl.bindFramebufferInfo(this._gl, null);

    // swap texture and frambuffer references for next render
    [this._textures.simA, this._textures.simB] =
      [this._textures.simB, this._textures.simA];
    [this._framebuffers.simA, this._framebuffers.simB] =
      [this._framebuffers.simB, this._framebuffers.simA];
  }

  // render the particles to the screen, where sharedUnfiorms determines the
  // projection, zoom, and lonLat centering
  //
  // size: any value > 0, diameter of particles in pixels at a zoom value of 1
  // and a canvas (drawing buffer) height of 1080 pixels.
  //
  // opacity: from 0 to 1, baseline for how see-through the particles are
  //
  // opacitySpeedDecay: from 0 to 1, how much speed affects opacity, with
  // slower-moving particles having less opacity
  draw(sharedUniforms, size, opacity, opacitySpeedDecay) {
    glDraw(this._gl, this._programs.draw, this._buffers.draw, {
      u_particlePositions: this._textures.simA,
      u_particleCountSqrt: Math.sqrt(this._count),
      u_size: size,
      u_color: [1, 1, 1, opacity],
      u_opacitySpeedDecay: opacitySpeedDecay,
      ...sharedUniforms,
    }, this._gl.POINTS);
  }

  // render particles with trails to the screen
  //
  // size, opacity, opacitySpeedDecay: see this.draw()
  //
  // fade: from 0 to 1, what proportion of the opacity from the previous
  // drawWithTrails draw call should be maintained as the background for this
  // draw call
  drawWithTrails(sharedUniforms, size, opacity, opacitySpeedDecay, fade) {
    // first, draw previous background (slightly faded) to empty texture
    twgl.bindFramebufferInfo(this._gl, this._framebuffers.particleTrailsB);

    this._gl.disable(this._gl.BLEND);

    glDraw(this._gl, this._programs.texture, this._buffers.texture, {
      u_texture: this._textures.particleTrailsA,
      u_fade: fade,
    });

    this._gl.enable(this._gl.BLEND);

    // then, draw new particle positions on top of that
    this.draw(sharedUniforms, size, opacity, opacitySpeedDecay);

    // finally, draw texture to screen
    twgl.bindFramebufferInfo(this._gl, null);

    glDraw(this._gl, this._programs.texture, this._buffers.texture, {
      u_texture: this._textures.particleTrailsB,
      u_fade: 1,
    });

    // swap textures and framebuffers for next call
    [this._textures.particleTrailsA, this._textures.particleTrailsB] =
      [this._textures.particleTrailsB, this._textures.particleTrailsA];
    [this._framebuffers.particleTrailsA, this._framebuffers.particleTrailsB] =
      [this._framebuffers.particleTrailsB, this._framebuffers.particleTrailsA];
  }

  // start drawing trails from scratch again (when map is moved or zoomed)
  resetTrails() {
    twgl.resizeFramebufferInfo(this._gl, this._framebuffers.particleTrailsA, [{
      attachment: this._textures.particleTrailsA,
    }]);
    twgl.resizeFramebufferInfo(this._gl, this._framebuffers.particleTrailsB, [{
      attachment: this._textures.particleTrailsB,
    }]);

    twgl.bindFramebufferInfo(this._gl, this._framebuffers.particleTrailsA);
    this._gl.clear(this._gl.COLOR_BUFFER_BIT);

    twgl.bindFramebufferInfo(this._gl, null);
    this._gl.clear(this._gl.COLOR_BUFFER_BIT);
  }

  _createPrograms() {
    return {
      sim: twgl.createProgramInfo(this._gl, [simVert, simFrag]),
      draw: twgl.createProgramInfo(this._gl, [drawVert, drawFrag]),
      texture: twgl.createProgramInfo(this._gl, [textureVert, textureFrag]),
    };
  }

  _createBuffers() {
    let quadBuffer = twgl.createBufferInfoFromArrays(this._gl, griddedArrays);
    return {
      sim: quadBuffer,
      draw: this._createDrawBuffer(),
      texture: quadBuffer,
    };
  }

  _createDrawBuffer() {
    let indices = new Float32Array(2 * this._count);

    for (let i = 0; i < indices.length; i++) {
      let j = Math.floor(i / 2);
      if (i % 2 === 0) {
        indices[i] = Math.floor(j / Math.sqrt(this._count));
      } else {
        indices[i] = j % Math.sqrt(this._count);
      }
    }

    return twgl.createBufferInfoFromArrays(this._gl, {
      a_particleIndex: {
        numComponents: 2, // indicate we are using 2-dimensional points
        data: indices,
      },
    });
  }

  _createTextures() {
    const randomTextureSize = 128;
    const length = Math.pow(randomTextureSize, 2);

    return {
      random: twgl.createTexture(this._gl, {
        src: Float32Array.from({ length }, () => Math.random()),
        type: this._gl.FLOAT,
        format: this._gl.RED,
        internalFormat: this._gl.R32F,
        minMag: this._gl.NEAREST,
        width: randomTextureSize,
        height: randomTextureSize,
      }),
      simA: this._createSimATexture(),
      simB: this._createSimBTexture(),
      vectorFieldU: this._createVectorFieldTexture(this._data.uVelocities),
      vectorFieldV: this._createVectorFieldTexture(this._data.vVelocities),
      particleTrailsA: this._createParticleTrailsTexture(),
      particleTrailsB: this._createParticleTrailsTexture(),
    };
  }

  _createSimATexture() {
    return twgl.createTexture(this._gl, {
      type: this._gl.INT,
      format: this._gl.RGBA_INTEGER,
      internalFormat: this._gl.RGBA32I,
      minMag: this._gl.NEAREST,
      width: Math.sqrt(this._count),
      height: Math.sqrt(this._count),
      src: new Int32Array(
        Float32Array.from({ length: this._count * 4 }, (_, i) => {
          switch(i % 4) {
            case 0: return randlon();
            case 1: return randlat();
            case 2: return this._lifetime * Math.random();
            default: return 0;
          }
        }).buffer
      ),
    });
  }

  _createSimBTexture() {
    return twgl.createTexture(this._gl, {
      type: this._gl.INT,
      format: this._gl.RGBA_INTEGER,
      internalFormat: this._gl.RGBA32I,
      minMag: this._gl.NEAREST,
      width: Math.sqrt(this._count),
      height: Math.sqrt(this._count),
    });
  }

  _createVectorFieldTexture(src) {
    let halfFloat = src.constructor.name !== 'Float32Array';

    return twgl.createTexture(this._gl, {
      src:            halfFloat ? new Uint16Array(src.buffer) : src,
      type:           halfFloat ? this._gl.HALF_FLOAT : this._gl.FLOAT,
      internalFormat: halfFloat ? this._gl.R16F : this._gl.R32F,
      format: this._gl.RED,
      minMag: this._linearFiltering ? this._gl.LINEAR : this._gl.NEAREST,
      width: this._data.width,
      height: this._data.height,
    });
  }

  _createParticleTrailsTexture() {
    return twgl.createTexture(this._gl, {
      minMag: this._gl.NEAREST,
      width: this._gl.canvas.width * window.devicePixelRatio,
      height: this._gl.canvas.height * window.devicePixelRatio,
      auto: false,
    });
  }

  _createFramebuffers() {
    return {
      simA: this._createSimFramebuffer(this._textures.simA),
      simB: this._createSimFramebuffer(this._textures.simB),
      particleTrailsA: this._createParticleTrailsFramebuffer(
        this._textures.particleTrailsA,
      ),
      particleTrailsB: this._createParticleTrailsFramebuffer(
        this._textures.particleTrailsB,
      ),
    };
  }

  _createSimFramebuffer(texture) {
    return twgl.createFramebufferInfo(
      this._gl,
      [{ attachment: texture }],
      Math.sqrt(this._count),
      Math.sqrt(this._count),
    );
  }

  _createParticleTrailsFramebuffer(texture) {
    return twgl.createFramebufferInfo(
      this._gl,
      [{ attachment: texture }],
      this._gl.canvas.width * window.devicePixelRatio,
      this._gl.canvas.height * window.devicePixelRatio,
    );
  }

  _roundToSquareNumber(x) {
    return Math.pow(Math.floor(Math.sqrt(x)), 2);
  }
}
