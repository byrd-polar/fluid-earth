#pragma glslify: export(robinson)
#pragma glslify: rotate = require(../rotate/invert.glsl)
#pragma glslify: K = require(./K.glsl)

void robinson(in vec2 coord, in vec2 lonLat0, out vec2 lonLat) {
  float phi = degrees(coord.y);
  float i, di;
  int i0;
  vec2 a, b, c;

  for (int j = 0; j < 5; j++) {
    i = min(18.0, abs(phi / 5.0));
    di = i - floor(i);
    i0 = int(floor(i));
    a = K(i0);
    b = K(i0 + 1);
    c = K(i0 + 2);
    phi -= degrees(
      sign(coord.y)
      * (b.y + di * (c.y - a.y) / 2.0 + di * di * (c.y - 2.0 * b.y + a.y))
      - coord.y
    );
  }

  lonLat.x = coord.x
    / (b.x + di * (c.x - a.x) / 2.0 + di * di * (c.x - 2.0 * b.x + a.x) / 2.0);
  lonLat.y = radians(phi);

  rotate(lonLat0, lonLat);
}
