#pragma glslify: export(equirectangular)
#pragma glslify: rotate = require(../rotate/invert.glsl)

void equirectangular(in vec2 coord, in vec2 lonLat0, out vec2 lonLat) {
  lonLat.x = coord.x;
  lonLat.y = coord.y;

  rotate(lonLat0, lonLat);
}
