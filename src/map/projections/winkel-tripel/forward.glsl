#pragma glslify: export(winkelTripel)
#pragma glslify: rotate = require(../rotate/forward.glsl)

const float halfPi = radians(90.0);

void winkelTripel(out vec2 coord, in vec2 lonLat0, in vec2 lonLat) {
  rotate(lonLat0, lonLat);

  float c = cos(lonLat.y);
  float a = acos(c * cos(lonLat.x / 2.0));
  float s = a == 0.0 ? 1.0 : a / sin(a);

  float x = 2.0 * c * sin(lonLat.x / 2.0) * s;
  float y = sin(lonLat.y) * s;

  coord.x = (x + lonLat.x / halfPi) / 2.0;
  coord.y = (y + lonLat.y) / 2.0;
}
