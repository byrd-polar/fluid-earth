import * as twgl from 'twgl.js';

import simVert from '../gridded.vert';
import simFrag from './step.frag';
import drawVert from './draw.vert';
import drawFrag from '../vector.frag';

import { glDraw, griddedArrays } from '../webgl.js';
import {
  randomLongitudeArray,
  randomLatitudeArray,
  randomArray,
} from './random.js';

export default class ParticleSimulator {
  constructor(gl, options) {
    // public variables (no special actions needed in setters)
    this.rate = options.particles.rate;

    // private variables with corresponding public setters
    this._count = sqrtFloor(options.particles.count);
    this._lifetime = options.particles.lifetime;
    this._data = options.data;

    // private variables (no setters)
    this._gl = gl;
    this._gl.enable(gl.BLEND);
    this._gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    this._gl.getExtension('OES_texture_float');
    this._gl.getExtension('OES_texture_float_linear');
    this._gl.getExtension('WEBGL_color_buffer_float');
    this._gl.getExtension('EXT_float_blend');

    this._programs = this._createPrograms();
    this._buffers = this._createBuffers();
    this._textures = this._createTextures();
    this._framebuffers = this._createFramebuffers();
  }

  set count(c) {
    this._count = sqrtFloor(c);

    this._gl.deleteBuffer(this._buffers.draw.indices);
    this._gl.deleteTexture(this._textures.simA);
    this._gl.deleteTexture(this._textures.simB);
    this._gl.deleteFramebuffer(this._framebuffers.simA.framebuffer);
    this._gl.deleteFramebuffer(this._framebuffers.simB.framebuffer);

    this._buffers.draw = this._createDrawBuffer();
    this._textures.simA = this._createSimATexture(),
    this._textures.simB = this._createSimBTexture(),
    this._framebuffers = this._createFramebuffers();
  }

  set lifetime(l) {
    this._lifetime = l;
    this._textures.simA = this._createSimATexture();
    this._framebuffers = this._createFramebuffers();
  }

  set data(d) {
    this._data = d;
    this._gl.deleteTexture(this._textures.vectorField);
    this._textures.vectorField = this._createVectorFieldTexture();
  }

  // using data in this._textures.simA, simulate and render to
  // this._framebuffers.simB (with this._textures.simB attached) the new
  // particle positions after timeDelta ms have passed
  step(timeDelta) {
    // switch rendering destination to our framebuffer
    twgl.bindFramebufferInfo(this._gl, this._framebuffers.simB);

    glDraw(this._gl, this._programs.sim, this._buffers.sim, {
      u_particleData: this._textures.simA,
      u_vectorField: this._textures.vectorField,
      u_random: this._textures.random,
      u_particleLifetime: this._lifetime,
      u_randLonLatOffsets: [Math.random(), Math.random()],
      u_particleCountSqrt: Math.sqrt(this._count),
      u_timeDelta: timeDelta,
      u_rate: this.rate,
    });

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
  draw(sharedUniforms) {
    glDraw(this._gl, this._programs.draw, this._buffers.draw, {
      u_particlePositions: this._textures.simA,
      u_particleCountSqrt: Math.sqrt(this._count),
      u_color: [1, 1, 1, 0.2],
      ...sharedUniforms,
    }, this._gl.POINTS);
  }

  _createPrograms() {
    return {
      sim: twgl.createProgramInfo(this._gl, [simVert, simFrag]),
      draw: twgl.createProgramInfo(this._gl, [drawVert, drawFrag]),
    };
  }

  _createBuffers() {
    return {
      sim: twgl.createBufferInfoFromArrays(this._gl, griddedArrays),
      draw: this._createDrawBuffer(),
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
    const randomTextureSize = 2048;

    return {
      random: twgl.createTexture(this._gl, {
        src: randomArray(1, Math.pow(randomTextureSize, 2)),
        type: this._gl.FLOAT,
        format: this._gl.ALPHA,
        minMag: this._gl.NEAREST,
        width: randomTextureSize,
        height: randomTextureSize,
      }),
      simA: this._createSimATexture(),
      simB: this._createSimBTexture(),
      vectorField: this._createVectorFieldTexture(),
    };
  }

  _createSimATexture() {
    return twgl.createTexture(this._gl, {
      type: this._gl.FLOAT,
      minMag: this._gl.NEAREST,
      width: Math.sqrt(this._count),
      height: Math.sqrt(this._count),
      src: interleave4(
        randomLongitudeArray(this._count),
        randomLatitudeArray(this._count),
        randomArray(this._lifetime, this._count),
      ),
    });
  }

  _createSimBTexture() {
    return twgl.createTexture(this._gl, {
      type: this._gl.FLOAT,
      minMag: this._gl.NEAREST,
      width: Math.sqrt(this._count),
      height: Math.sqrt(this._count),
    });
  }

  _createVectorFieldTexture() {
    return twgl.createTexture(this._gl, {
      src: interleave4(this._data.uVelocities, this._data.vVelocities),
      type: this._gl.FLOAT,
      minMag: this._gl.LINEAR, // requires OES_texture_float_linear
      width: this._data.width,
      height: this._data.height,
    });
  }

  _createFramebuffers() {
    return {
      simA: twgl.createFramebufferInfo(
        this._gl,
        [{ attachment: this._textures.simA }],
        Math.sqrt(this._count),
        Math.sqrt(this._count),
      ),
      simB: twgl.createFramebufferInfo(
        this._gl,
        [{ attachment: this._textures.simB }],
        Math.sqrt(this._count),
        Math.sqrt(this._count),
      ),
    };
  }
}

function sqrtFloor(x) {
  return Math.pow(Math.floor(Math.sqrt(x)), 2);
}

function interleave4(arrayR, arrayG, arrayB, arrayA) {
  let interleaved = new Float32Array(4 * arrayR.length);

  for (let i = 0; i < interleaved.length; i++) {
    if (i % 4 === 0) {
      interleaved[i] = arrayR[i/4];
    } else if (i % 4 === 1) {
      interleaved[i] = arrayG[Math.floor(i/4)];
    } else if (i % 4 === 2 && arrayB) {
      interleaved[i] = arrayB[Math.floor(i/4)];
    } else if (arrayA) {
      interleaved[i] = arrayA[Math.floor(i/4)];
    }
  }

  return interleaved;
}
