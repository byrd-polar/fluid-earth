#pragma glslify: export(equirectangular)
#pragma glslify: rotate = require(../rotate/forward.glsl)

const float PI = radians(180.0);

void equirectangular(out vec2 coord, in vec2 lonLat0, in vec2 lonLat,
    out bool clip) {
  rotate(lonLat0, lonLat);

  float distanceFromMeridian = abs(lonLat.x); // coordinates already rotated
  clip = distanceFromMeridian > PI - radians(1.0);

  coord.x = lonLat.x;
  coord.y = lonLat.y;
}
