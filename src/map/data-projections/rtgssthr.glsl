#pragma glslify: export(rtgssthr)

const float PI = radians(180.0);
const float PI_2 = radians(90.0);

void rtgssthr(out vec2 textureCoord, in vec2 lonLat,
    in float gridWidth, in float gridHeight) {
  textureCoord = (lonLat + vec2(0, PI_2)) / vec2(2.0 * PI, PI);
  textureCoord.y = 1.0 - textureCoord.y;

  textureCoord.x = mod(textureCoord.x, 1.0);
}
