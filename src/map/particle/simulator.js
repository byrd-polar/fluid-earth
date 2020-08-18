import * as twgl from 'twgl.js';

import griddedVertexShader from '../gridded.vert';
import particleStepShader from './step.frag';

import particleDrawShader from './draw.vert';
import vectorFragmentShader from '../vector.frag';

import { griddedArrays } from '../arrays.js';

export class ParticleSimulator {
  constructor(gl, vectorFieldOptions) {
    this.gl = gl;

    this.simulator = twgl.createProgramInfo(this.gl, [
      griddedVertexShader,
      particleStepShader,
    ]);
    this.simBuffer = twgl.createBufferInfoFromArrays(gl, griddedArrays);

    this.drawer = twgl.createProgramInfo(this.gl, [
      particleDrawShader,
      vectorFragmentShader,
    ]);

    this.updateParticleCount(vectorFieldOptions);
    this.updateVectorField(vectorFieldOptions);
  }

  updateParticleCount(vectorFieldOptions) {
    let particleCountSqrt =
      Math.floor(Math.sqrt(vectorFieldOptions.particles.count));
    let actualParticleCount = Math.pow(particleCountSqrt, 2);

    if (this.particleCountSqrt === particleCountSqrt) {
      return;
    } else {
      this.particleCountSqrt = particleCountSqrt;
    }

    this.gl.deleteTexture(this.particlePositionsA);
    this.gl.deleteTexture(this.particlePositionsB);
    if (this.framebufferInfoA && this.framebufferInfoB) {
      this.gl.deleteFramebuffer(this.framebufferInfoA.framebuffer);
      this.gl.deleteFramebuffer(this.framebufferInfoB.framebuffer);
    }

    // particle positions saved as float textures
    // format needs to RGBA, or else not "renderable" for simulation
    let textureOptions = {
      type: this.gl.FLOAT, // 32-bit floating data
      format: this.gl.RGBA, // 4 channels per pixel, only using first two
      minMag: this.gl.NEAREST,
      width: this.particleCountSqrt,
      height: this.particleCountSqrt,
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

    // attributes used in draw program
    let indices = new Float32Array(2 * actualParticleCount);
    for (let i = 0; i < indices.length; i++) {
      let j = Math.floor(i / 2);
      if (i % 2 === 0) {
        indices[i] = Math.floor(j / this.particleCountSqrt);
      } else {
        indices[i] = j % this.particleCountSqrt;
      }
    }
    this.drawBuffer = twgl.createBufferInfoFromArrays(this.gl, {
      a_particleIndex: {
        numComponents: 2, // Indicate we are using 2-dimensional points
        data: indices,
      }
    });
  }

  updateVectorField(vectorFieldOptions) {
    this.gl.deleteTexture(this.vectorField);

    // particle velocities saved as float texture
    this.vectorField = twgl.createTexture(this.gl, {
      src: interleave4(
        vectorFieldOptions.data.uVelocities,
        vectorFieldOptions.data.vVelocities,
      ),
      type: this.gl.FLOAT, // 32-bit floating data
      format: this.gl.RGBA, // 4 channels per pixel, only using first two
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

  draw(sharedUniforms) {
    const uniforms = {
      u_particlePositions: this.particlePositionsA,
      u_particleCountSqrt: this.particleCountSqrt,
      u_color: [1, 1, 1, 0.2],
      ...sharedUniforms,
    }

    this.gl.useProgram(this.drawer.program);
    twgl.setBuffersAndAttributes(this.gl, this.drawer, this.drawBuffer);
    twgl.setUniformsAndBindTextures(this.drawer, uniforms);
    twgl.drawBufferInfo(this.gl, this.drawBuffer, this.gl.POINTS);
  }
}

function createFbi(gl, texture, textureOptions) {
  return twgl.createFramebufferInfo(gl, [{
    attachment: texture,
    ...textureOptions,
  }], textureOptions.width, textureOptions.height);
}

function interleave4(arrayA, arrayB) {
  let interleaved = new Float32Array(4 * arrayA.length);

  for (let i = 0; i < interleaved.length; i++) {
    if (i % 4 === 0) {
      interleaved[i] = arrayA[i/4];
    } else if (i % 4 === 1) {
      interleaved[i] = arrayB[Math.floor(i/4)];
    } else {
      interleaved[i] = 0;
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
