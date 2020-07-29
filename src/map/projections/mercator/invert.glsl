#pragma glslify: export(mercator)
#pragma glslify: rotate = require(../rotate/invert.glsl)

void mercator(in vec2 coord, in vec2 lonLat0, out vec2 lonLat) {
  lonLat.x = coord.x;
  lonLat.y = 2.0 * atan(exp(coord.y)) - radians(90.0);

  rotate(lonLat0, lonLat);
}
