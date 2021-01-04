#pragma glslify: export(sterographic)
#pragma glslify: rotate = require(../rotate/invert.glsl)

void sterographic(in vec2 coord, in vec2 lonLat0, out vec2 lonLat) {
  float z = sqrt(pow(coord.x, 2.0) + pow(coord.y, 2.0));
  float c = 2.0 * atan(z);
  float sc = sin(c);
  float cc = cos(c);

  lonLat.x = atan(coord.x * sc, z * cc);
  if (z == 0.0) {
    lonLat.y = 0.0;
  } else {
    lonLat.y = asin(coord.y * sc / z);
  }

  rotate(lonLat0, lonLat);
}
