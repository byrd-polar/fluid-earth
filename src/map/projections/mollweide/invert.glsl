#pragma glslify: export(mollweide)
#pragma glslify: rotate = require(../rotate/invert.glsl)

const float sqrt2 = sqrt(2.0);
const float halfPi = radians(90.0);
const float pi = radians(180.0);

void mollweide(in vec2 coord, in vec2 lonLat0, out vec2 lonLat) {
  if (abs(coord.y) > sqrt2) {
    lonLat = vec2(100, 100);
    return;
  }

  float y = asin(coord.y / sqrt2);
  lonLat.x = coord.x / ((sqrt2 / halfPi) * cos(y));
  lonLat.y = asin((2.0 * y + sin(2.0 * y)) / pi);

  rotate(lonLat0, lonLat);
}
