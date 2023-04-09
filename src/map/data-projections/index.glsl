#pragma glslify: export(projectToTexture)
#pragma glslify: p0 = require(../projections/stereographic/forward.glsl)

const float PI = radians(180.0);
const float PI_2 = radians(90.0);

void projectToTexture(
    out vec2 textureCoord,
    in vec2 lonLat,
    in float gridWidth,
    in float gridHeight,
    in int projection
) {
  // ERA5
  if (projection == -1) {
    textureCoord = (lonLat + vec2(0, PI_2)) / vec2(2.0 * PI, PI);

    float xOffset = 0.5 / gridWidth;
    float yScale = -(gridHeight - 1.0) / gridHeight;

    textureCoord.x = mod(textureCoord.x + xOffset, 1.0);
    textureCoord.y = yScale * (textureCoord.y - 0.5) + 0.5;
  }
  // GFS
  else if (projection == 0) {

    textureCoord = (lonLat + vec2(0, PI_2)) / vec2(2.0 * PI, PI);

    float xOffset = 0.5 / gridWidth;
    float yScale = (gridHeight - 1.0) / gridHeight;

    textureCoord.x = mod(textureCoord.x + xOffset, 1.0);
    textureCoord.y = yScale * (textureCoord.y - 0.5) + 0.5;
  }
  // RTGSSTHR
  else if (projection == 1) {

    textureCoord = (lonLat + vec2(0, PI_2)) / vec2(2.0 * PI, PI);
    textureCoord.x = mod(textureCoord.x, 1.0);
  }
  // GEOS
  else if (projection == 3) {

    textureCoord = (lonLat + vec2(PI, PI_2)) / vec2(2.0 * PI, PI);

    float xOffset = 0.5 / gridWidth;
    float yScale = (gridHeight - 1.0) / gridHeight;

    textureCoord.x = mod(textureCoord.x + xOffset, 1.0);
    textureCoord.y = yScale * (textureCoord.y - 0.5) + 0.5;

  }
  // OSCAR
  else if (projection == 2) {

    textureCoord = (lonLat + vec2(radians(-20.0), PI_2)) / vec2(2.0 * PI, PI);

    float xOffset = 0.5 / gridWidth;
    float xScale = 1080.0 / gridWidth;
    float yScale = (90.0 / 80.0) * (gridHeight - 1.0) / gridHeight;

    textureCoord.x = mod(xScale * (textureCoord.x + xOffset), xScale);
    textureCoord.y = 1.0 - (yScale * (textureCoord.y - 0.5) + 0.5);

    // get a NaN (actually -Infinity) value for areas outside of texture
    if (textureCoord.y > 1.0 || textureCoord.y < 0.0) {
      textureCoord = vec2(0.0, 0.5);
    }
  }
  // PERMAFROST
  else if (projection == 4) {
    vec2 lonLat0 = vec2(0.0, PI_2);
    p0(textureCoord, lonLat0, lonLat);

    textureCoord.x = (textureCoord.x + 0.8407) / 1.6814;
    textureCoord.y = (-textureCoord.y + 0.7443) / 1.5855;

    textureCoord.x = (textureCoord.x * (gridWidth - 1.0) + 0.5) / gridWidth;
    textureCoord.y = (textureCoord.y * (gridHeight - 1.0) + 0.5) / gridHeight;

    // get a NaN (actually -Infinity) value for areas outside of texture
    if (textureCoord.y > 1.0 || textureCoord.y < 0.0 ||
        textureCoord.x > 1.0 || textureCoord.x < 0.0) {
      textureCoord = vec2(0.0, 0.5);
    }
  }
}
