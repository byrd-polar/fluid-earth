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
