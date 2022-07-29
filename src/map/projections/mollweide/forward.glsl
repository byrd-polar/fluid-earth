#pragma glslify: export(mollweide)
#pragma glslify: rotate = require(../rotate/forward.glsl)

const float sqrt2 = sqrt(2.0);
const float halfPi = radians(90.0);
const float pi = radians(180.0);

void mollweide(out vec2 coord, in vec2 lonLat0, in vec2 lonLat) {
  rotate(lonLat0, lonLat);

  float s = pi * sin(lonLat.y);
  float theta = lonLat.y;

  for (int i = 0; i < 30; i++) {
    theta -= (theta + sin(theta) - s) / (1.0 + cos(theta));
  }
  theta /= 2.0;

  coord.x = (sqrt2 / halfPi) * lonLat.x * cos(theta);
  coord.y = sqrt2 * sin(theta);
}
