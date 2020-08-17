import * as twgl from 'twgl.js';

import griddedVertexShader from './gridded.vert';
import particleFragmentShader from './particleSim.frag';

import { griddedArrays } from './arrays.js';

export class ParticleSimulator {
  constructor(gl, vectorFieldOptions) {
    this.gl = gl;

    this.simulator = twgl.createProgramInfo(this.gl, [
      griddedVertexShader,
      particleFragmentShader,
    ]);

    this.simBuffer = twgl.createBufferInfoFromArrays(gl, griddedArrays);

    this.updateParticleCount(vectorFieldOptions);
    this.updateVectorField(vectorFieldOptions);
  }

  updateParticleCount(vectorFieldOptions) {
    this.gl.deleteTexture(this.particlePositionsA);
    this.gl.deleteTexture(this.particlePositionsB);
    if (this.framebufferInfoA && this.framebufferInfoB) {
      this.gl.deleteFramebuffer(this.framebufferInfoA.framebuffer);
      this.gl.deleteFramebuffer(this.framebufferInfoB.framebuffer);
    }

    let particleCountSqrt =
      Math.floor(Math.sqrt(vectorFieldOptions.particleCount));
    let actualParticleCount = Math.pow(particleCountSqrt, 2);

    // particle positions saved as float textures
    // format needs to RGBA, or else not "renderable" for simulation
    let textureOptions = {
      type: this.gl.FLOAT, // 32-bit floating data
      format: this.gl.RGBA, // 4 channels per pixel, only using first two
      minMag: this.gl.NEAREST,
      width: particleCountSqrt,
      height: particleCountSqrt,
    }

    this.particlePositionsA = twgl.createTexture(this.gl, {
      src: interleave4(
        randomLongitudeArray(actualParticleCount),
        randomLatitudeArray(actualParticleCount),
      ),
      ...textureOptions
    });
    this.particlePositionsB = twgl.createTexture(this.gl, textureOptions);

    // two framebuffers with textured attached used for simulation by writing
    // from one texture to the other
    this.framebufferInfoA = createFbi(
      this.gl, this.particlePositionsA, textureOptions
    );
    this.framebufferInfoB = createFbi(
      this.gl, this.particlePositionsB, textureOptions
    );
  }

  updateVectorField(vectorFieldOptions) {
    this.gl.deleteTexture(this.vectorField);

    // particle velocities saved as float texture
    this.vectorField = twgl.createTexture(this.gl, {
      src: interleave(
        vectorFieldOptions.data.uVelocities,
        vectorFieldOptions.data.vVelocities,
      ),
      type: this.gl.FLOAT, // 32-bit floating data
      format: this.gl.LUMINANCE_ALPHA, // 2 channels per pixel
      minMag: this.gl.LINEAR, // requires OES_texture_float_linear
      width: vectorFieldOptions.data.width,
      height: vectorFieldOptions.data.height,
    });
  }

  // using data in this.particlePositionsA, simulate and render to
  // this.framebufferInfoB (with this.particlePositionsB attached) the new
  // particle positions after timeDelta ms have passed
  step(timeDelta) {
    // switch rendering destination to our framebuffer
    twgl.bindFramebufferInfo(this.gl, this.framebufferInfoB);

    const uniforms = {
      u_coordinates: this.particlePositionsA,
      u_vectorField: this.vectorField,
    }

    this.gl.useProgram(this.simulator.program);
    twgl.setBuffersAndAttributes(this.gl, this.simulator, this.simBuffer);
    twgl.setUniformsAndBindTextures(this.simulator, uniforms);
    twgl.drawBufferInfo(this.gl, this.simBuffer);

    // switch rendering destination back to canvas
    twgl.bindFramebufferInfo(this.gl, null);

    // swap texture and frambuffer references for next render
    [this.particlePositionsA, this.particlePositionsB] =
      [this.particlePositionsB, this.particlePositionsA];
    [this.framebufferInfoA, this.framebufferInfoB] =
      [this.framebufferInfoB, this.framebufferInfoA];
  }
}

function createFbi(gl, texture, textureOptions) {
  return twgl.createFramebufferInfo(gl, [{
    attachment: texture,
    ...textureOptions,
  }], textureOptions.width, textureOptions.height);
}

function interleave(arrayA, arrayB) {
  let interleaved = new Float32Array(2 * arrayA.length);

  for (let i = 0; i < interleaved.length; i++) {
    if (i % 2 === 0) {
      interleaved[i] = arrayA[i/2];
    } else {
      interleaved[i] = arrayB[Math.floor(i/2)];
    }
  }

  return interleaved;
}

function randomLongitudeArray(length) {
  let random = new Float32Array(length);

  for (let i = 0; i < random.length; i++) {
    random[i] = 360 * Math.random() - 180;
  }

  return random;
}

function randomLatitudeArray(length) {
  let random = new Float32Array(length);

  for (let i = 0; i < random.length; i++) {
    random[i] = (180 / Math.PI) * Math.asin(2 * Math.random() - 1);
  }

  return random;
}
