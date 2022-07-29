#pragma glslify: export(robinson)
#pragma glslify: rotate = require(../rotate/forward.glsl)
#pragma glslify: K = require(./K.glsl)

const float pi = radians(180.0);

void robinson(out vec2 coord, in vec2 lonLat0, in vec2 lonLat) {
  rotate(lonLat0, lonLat);

  float i = min(18.0, abs(lonLat.y) * 36.0 / pi);
  float di = i - floor(i);
  int i0 = int(floor(i));
  vec2 a = K(i0);
  vec2 b = K(i0 + 1);
  vec2 c = K(i0 + 2);

  coord = vec2(lonLat.x, sign(lonLat.y))
    * (b + di * (c - a) / 2.0 + di * di * (c - 2.0 * b + a) / 2.0);
}
