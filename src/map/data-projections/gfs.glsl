#pragma glslify: export(gfs)

const float PI = radians(180.0);
const float PI_2 = radians(90.0);

void gfs(out vec2 textureCoord, in vec2 lonLat,
    in float gridWidth, in float gridHeight) {
  textureCoord = (lonLat + vec2(0, PI_2)) / vec2(2.0 * PI, PI);
  textureCoord.y = 1.0 - textureCoord.y;

  float xOffset = 0.5 / gridWidth;
  float yScale = (gridHeight - 1.0) / gridHeight;

  textureCoord.x = mod(textureCoord.x + xOffset, 1.0);
  textureCoord.y = yScale * (textureCoord.y - 0.5) + 0.5;
}
