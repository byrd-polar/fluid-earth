// Creates a grid of points in clip space from top left corner (-1,1) to
// bottom right corner (1,-1)
//
// e.g. for a width and height of 2:
//
//     . . .
//     . . .
//     . . .
//
// we get the following, where each line represents one point (x,y)
// [
//   -1,  1,
//    0,  1,
//    1,  1,
//   -1,  0,
//    0,  0,
//    1,  0,
//   -1, -1,
//    0, -1,
//    1, -1
// ]
export function clipSpacePointsGrid(width, height) {
  let data = [];
  const points = (width + 1) * (height + 1);

  for (let i=0; i < points; i++) {
    data[2*i] = -1 + (2 * (i % (width + 1)) / width);
    data[2 *i+1] = 1 - (2 * Math.floor(i / (width + 1))) / height;
  }

  return data;
}


// Return indices for a triangle strip, as demonstrated here:
// https://www.learnopengles.com/tag/triangle-strips/
//
// (except w/ indices starting at zero, not one)
export function triangleStripIndices(width, height) {
  let indices = [];

  for (let i=0; i < height; i++) {
    for (let j=0; j < width + 1; j++) {
      indices.push(j + i * (width + 1));
      indices.push(j + (i + 1) * (width + 1));
    }
    // create degenerate triangles so we can start next row
    if (i !== height - 1) {
      indices.push(width + (i + 1) * (width + 1));
      indices.push(0 + (i + 1) * (width + 1));
    }
  }
  return indices;
}
