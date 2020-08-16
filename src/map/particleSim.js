import * as twgl from 'twgl.js';

export class ParticleSimulator {
  constructor(gl, vectorFieldOptions) {
    this.gl = gl;

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
    let textureOptions = {
      type: this.gl.FLOAT, // 32-bit floating data
      format: this.gl.LUMINANCE_ALPHA, // 2 channels per pixel
      minMag: this.gl.NEAREST,
      width: particleCountSqrt,
      height: particleCountSqrt,
    }

    this.particlePositionsA = twgl.createTexture(this.gl, {
      src: interleave(
        randomArray(-180, 180, actualParticleCount),
        randomArray(-90, 90, actualParticleCount),
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
    this.gl.deleteTexture(this.vectorFieldTexture);

    // particle velocities saved as float texture
    this.vectorFieldTexture = twgl.createTexture(this.gl, {
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
  stepSimulation(timeDelta) {
    // switch rendering destination to our framebuffer
    twgl.bindFramebufferInfo(this.gl, this.framebufferInfoB);

    // TODO

    // swap texture and frambuffer references for next render
    [this.particlePositionsA, this.particlePostionsB] =
      [this.particlePositionsB, this.particlePostionsA];
    [this.framebufferInfoA, this.framebufferInfoB] =
      [this.framebufferInfoB, this.framebufferInfoA];

    // switch rendering destination back to canvas
    twgl.bindFramebufferInfo(this.gl, null);
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

function randomArray(min, max, length) {
  let random = new Float32Array(length);

  for (let i = 0; i < random.length; i++) {
    random[i] = (max - min) * Math.random() + min;
  }

  return random;
}
