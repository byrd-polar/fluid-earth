#pragma glslify: export(equirectangular)
#pragma glslify: rotate = require(../rotate/forward.glsl)

void equirectangular(out vec2 coord, in vec2 lonLat0, in vec2 lonLat,
    out bool clip) {
  rotate(lonLat0, lonLat, clip);

  coord.x = lonLat.x;
  coord.y = lonLat.y;
}
