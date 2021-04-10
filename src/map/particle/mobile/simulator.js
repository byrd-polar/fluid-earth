import * as twgl from 'twgl.js';

import simVert from '../../gridded.vert';
import simLonFrag from './step_lon.frag';
import simLatFrag from './step_lat.frag';
import simLifeFrag from './step_life.frag';
import simSpeedFrag from './step_speed.frag';
import drawVert from './draw.vert';
import drawFrag from '../draw.frag';
import textureVert from '../../gridded.vert';
import textureFrag from '../texture.frag';

import { glDraw } from '../../webgl.js';
import ParticleSimulator from '../simulator.js';
import {
  randomLongitudeArray,
  randomLatitudeArray,
  randomArray,
} from '../random.js';


export default class ParticleSimulatorMobile extends ParticleSimulator {
  set count(c) {
    this._count = this._roundToSquareNumber(c);

    this._gl.deleteBuffer(this._buffers.draw.indices);
    this._gl.deleteTexture(this._textures.simA.longitudes);
    this._gl.deleteTexture(this._textures.simA.latitudes);
    this._gl.deleteTexture(this._textures.simA.lifetimes);
    this._gl.deleteTexture(this._textures.simA.speeds);
    this._gl.deleteTexture(this._textures.simB.longitudes);
    this._gl.deleteTexture(this._textures.simB.latitudes);
    this._gl.deleteTexture(this._textures.simB.lifetimes);
    this._gl.deleteTexture(this._textures.simB.speeds);
    this._gl.deleteFramebuffer(this._framebuffers.simA.longitudes.framebuffer);
    this._gl.deleteFramebuffer(this._framebuffers.simA.latitudes.framebuffer);
    this._gl.deleteFramebuffer(this._framebuffers.simA.lifetimes.framebuffer);
    this._gl.deleteFramebuffer(this._framebuffers.simA.speeds.framebuffer);
    this._gl.deleteFramebuffer(this._framebuffers.simB.longitudes.framebuffer);
    this._gl.deleteFramebuffer(this._framebuffers.simB.latitudes.framebuffer);
    this._gl.deleteFramebuffer(this._framebuffers.simB.lifetimes.framebuffer);
    this._gl.deleteFramebuffer(this._framebuffers.simB.speeds.framebuffer);

    this._buffers.draw = this._createDrawBuffer();
    this._textures.simA = this._createSimATexture(),
    this._textures.simB = this._createSimBTexture(),
    this._framebuffers = this._createFramebuffers();
  }

  step(timeDelta, rate) {
    const unis = {
      u_particleLongitudes: this._textures.simA.longitudes,
      u_particleLatitudes: this._textures.simA.latitudes,
      u_particleLifetimes: this._textures.simA.lifetimes,
      u_vectorFieldU: this._textures.vectorFieldU,
      u_vectorFieldV: this._textures.vectorFieldV,
      u_random: this._textures.random,
      u_particleLifetime: this._lifetime,
      u_randLonLatOffsets: [Math.random(), Math.random()],
      u_gridWidth: this._data.width,
      u_gridHeight: this._data.height,
      u_timeDelta: timeDelta,
      u_rate: rate,
    };

    this._gl.disable(this._gl.BLEND);

    twgl.bindFramebufferInfo(this._gl, this._framebuffers.simB.longitudes);
    glDraw(this._gl, this._programs.sim.longitudes, this._buffers.sim, unis);

    twgl.bindFramebufferInfo(this._gl, this._framebuffers.simB.latitudes);
    glDraw(this._gl, this._programs.sim.latitudes, this._buffers.sim, unis);

    twgl.bindFramebufferInfo(this._gl, this._framebuffers.simB.lifetimes);
    glDraw(this._gl, this._programs.sim.lifetimes, this._buffers.sim, unis);

    twgl.bindFramebufferInfo(this._gl, this._framebuffers.simB.speeds);
    glDraw(this._gl, this._programs.sim.speeds, this._buffers.sim, unis);

    this._gl.enable(this._gl.BLEND);
    twgl.bindFramebufferInfo(this._gl, null);

    [this._textures.simA.longitudes, this._textures.simB.longitudes] =
      [this._textures.simB.longitudes, this._textures.simA.longitudes];
    [this._textures.simA.latitudes, this._textures.simB.latitudes] =
      [this._textures.simB.latitudes, this._textures.simA.latitudes];
    [this._textures.simA.lifetimes, this._textures.simB.lifetimes] =
      [this._textures.simB.lifetimes, this._textures.simA.lifetimes];
    [this._textures.simA.speeds, this._textures.simB.speeds] =
      [this._textures.simB.speeds, this._textures.simA.speeds];
    [this._framebuffers.simA, this._framebuffers.simB] =
      [this._framebuffers.simB, this._framebuffers.simA];
  }

  draw(sharedUniforms, opacity) {
    super.draw({
      u_particleLongitudes: this._textures.simA.longitudes,
      u_particleLatitudes: this._textures.simA.latitudes,
      u_particleSpeeds: this._textures.simA.speeds,
      ...sharedUniforms,
    }, opacity);
  }

  drawWithTrails(sharedUniforms, size, opacity, fade) {
    super.drawWithTrails({
      u_particleLongitudes: this._textures.simA.longitudes,
      u_particleLatitudes: this._textures.simA.latitudes,
      u_particleSpeeds: this._textures.simA.speeds,
      ...sharedUniforms,
    }, size, opacity, fade);
  }

  _createPrograms() {
    let simLonFrag2 = this._webgl2 ?
      simLonFrag.replace(/\)\.a;/g, ').r;') :
      simLonFrag;
    let simLatFrag2 = this._webgl2 ?
      simLatFrag.replace(/\)\.a;/g, ').r;') :
      simLatFrag;
    let simSpeedFrag2 = this._webgl2 ?
      simSpeedFrag.replace(/\)\.a;/g, ').r;') :
      simSpeedFrag;
    return {
      sim: {
        longitudes: twgl.createProgramInfo(this._gl, [simVert, simLonFrag2]),
        latitudes: twgl.createProgramInfo(this._gl, [simVert, simLatFrag2]),
        lifetimes: twgl.createProgramInfo(this._gl, [simVert, simLifeFrag]),
        speeds: twgl.createProgramInfo(this._gl, [simVert, simSpeedFrag2]),
      },
      draw: twgl.createProgramInfo(this._gl, [drawVert, drawFrag]),
      texture: twgl.createProgramInfo(this._gl, [textureVert, textureFrag]),
    };
  }

  // actually the multiple textures needed to replace the original SimATexture,
  // not just single texture as suggested by the method name
  _createSimATexture() {
    let sharedOptions = {
      minMag: this._gl.NEAREST,
      width: Math.sqrt(this._count),
      height: Math.sqrt(this._count),
    }
    return {
      longitudes: twgl.createTexture(this._gl, {
        src: encodeToRGBA(randomLongitudeArray(this._count) , 360, -180),
        ...sharedOptions,
      }),
      latitudes: twgl.createTexture(this._gl, {
        src: encodeToRGBA(randomLatitudeArray(this._count) , 180, -90),
        ...sharedOptions,
      }),
      lifetimes: twgl.createTexture(this._gl, {
        src: encodeToRGBA(
          randomArray(this._lifetime, this._count), this._lifetime, 0
        ),
        ...sharedOptions,
      }),
      speeds: twgl.createTexture(this._gl, sharedOptions),
    };
  }

  // see above
  _createSimBTexture() {
    let sharedOptions = {
      minMag: this._gl.NEAREST,
      width: Math.sqrt(this._count),
      height: Math.sqrt(this._count),
    }
    return {
      longitudes: twgl.createTexture(this._gl, sharedOptions),
      latitudes: twgl.createTexture(this._gl, sharedOptions),
      lifetimes: twgl.createTexture(this._gl, sharedOptions),
      speeds: twgl.createTexture(this._gl, sharedOptions),
    };
  }

  _createSimFramebuffers() {
    let dim = Math.sqrt(this._count);
    return {
      simA: {
        longitudes: twgl.createFramebufferInfo(this._gl,
          [{ attachment: this._textures.simA.longitudes }],
          dim, dim
        ),
        latitudes: twgl.createFramebufferInfo(this._gl,
          [{ attachment: this._textures.simA.latitudes }],
          dim, dim
        ),
        lifetimes: twgl.createFramebufferInfo(this._gl,
          [{ attachment: this._textures.simA.lifetimes }],
          dim, dim
        ),
        speeds: twgl.createFramebufferInfo(this._gl,
          [{ attachment: this._textures.simA.speeds }],
          dim, dim
        ),
      },
      simB: {
        longitudes: twgl.createFramebufferInfo(this._gl,
          [{ attachment: this._textures.simB.longitudes }],
          dim, dim
        ),
        latitudes: twgl.createFramebufferInfo(this._gl,
          [{ attachment: this._textures.simB.latitudes }],
          dim, dim
        ),
        lifetimes: twgl.createFramebufferInfo(this._gl,
          [{ attachment: this._textures.simB.lifetimes }],
          dim, dim
        ),
        speeds: twgl.createFramebufferInfo(this._gl,
          [{ attachment: this._textures.simB.speeds }],
          dim, dim
        ),
      },
    };
  }
}

function encodeToRGBA(float32Array, scale, offset) {
  let rgba = new Uint32Array(float32Array.length);

  for(let i = 0; i < float32Array.length; i++) {
    let normalizedVal = (float32Array[i] - offset) / scale;

    rgba[i] = Math.round(Math.pow(256, 4) * normalizedVal);
  }

  return new Uint8Array(rgba.buffer);
}
