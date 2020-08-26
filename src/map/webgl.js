// attributes representing the corners of two triangles that span the entire
// canvas; useful for WebGL programs where all the logic takes place in the
// fragment shader and the vertex shader is only needed to define the render
// area
export const griddedArrays = {
  // A grid of points
  a_position: {
    numComponents: 2, // Indicate we are using 2-dimensional points
    data: [ // two right triangles that cover entire screen
      -1, -1,
      -1,  1,
       1, -1,
       1,  1,
       1, -1,
      -1,  1,
    ],
  },
};

import * as twgl from 'twgl.js';

// idiomatic (?) way to draw stuff with twgl
export function glDraw(gl, programInfo, bufferInfo, uniforms, type) {
  gl.useProgram(programInfo.program);
  twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
  twgl.setUniformsAndBindTextures(programInfo, uniforms);
  twgl.drawBufferInfo(gl, bufferInfo, type);
}
