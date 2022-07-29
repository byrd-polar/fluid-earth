#pragma glslify: export(mercator)
#pragma glslify: rotate = require(../rotate/forward.glsl)

const float PI_2 = radians(90.0);

void mercator(out vec2 coord, in vec2 lonLat0, in vec2 lonLat) {
  rotate(lonLat0, lonLat);

  coord.x = lonLat.x;
  coord.y = log(tan((PI_2 + lonLat.y) / 2.0));
}
