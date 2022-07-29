#pragma glslify: export(equirectangular)
#pragma glslify: rotate = require(../rotate/forward.glsl)

void equirectangular(out vec2 coord, in vec2 lonLat0, in vec2 lonLat) {
  rotate(lonLat0, lonLat);

  coord.x = lonLat.x;
  coord.y = lonLat.y;
}
