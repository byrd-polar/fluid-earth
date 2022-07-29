#pragma glslify: export(equalEarth)
#pragma glslify: rotate = require(../rotate/forward.glsl)

const float A1 = 1.340264;
const float A2 = -0.081106;
const float A3 = 0.000893;
const float A4 = 0.003796;
const float M = sqrt(3.0) / 2.0;

void equalEarth(out vec2 coord, in vec2 lonLat0, in vec2 lonLat) {
  rotate(lonLat0, lonLat);

  float l = asin(M * sin(lonLat.y));
  float l2 = l * l;
  float l6 = l2 * l2 * l2;

  coord.x = (lonLat.x) * cos(l) / (M * (A1 + 3.0 * A2 * l2 +
        l6 * (7.0 * A3 + 9.0 * A4 *l2)));
  coord.y = l * (A1 + A2 * l2 + l6 * (A3 + A4 * l2));
}
