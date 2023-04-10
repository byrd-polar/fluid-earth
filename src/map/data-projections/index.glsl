#pragma glslify: export(projectToTexture)
#pragma glslify: rotate = require(../projections/rotate/forward.glsl)

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

    // Derived based on "The Universal Grids and the Transverse Mercator and
    // Polar Stereographic Map Projections"
    //
    // https://earth-info.nga.mil/php/download.php?file=coord-utmups

    // WGS 84 constants
    const float a = 6378137.0;
    const float e = 0.081819190842621494335;

    // phiToChi (section 2.8)
    float P = exp(e * atanh(e * sin(lonLat.y)));
    float x = (1.0 + sin(lonLat.y)) / P;
    float y = (1.0 - sin(lonLat.y)) * P;
    float cosChi = 2.0 * cos(lonLat.y) / (x + y);
    float sinChi = (x - y) / (x + y);

    // standard parallel at 71 degrees, multiplied by 2 / k_90 (section 9.7)
    float k71 = 1.9390295659155423;
    float m = k71 * a * cosChi / (1.0 + sinChi);

    // simplied versions of f_1 and f_2 (section 8.1)
    textureCoord.x = m * sin(lonLat.x);
    textureCoord.y = -m * cos(lonLat.x);

    // following values from .tfw file
    textureCoord.x -= -10389109.8424841110;
    textureCoord.y -= 9199572.4044017550;
    textureCoord /= 926.6254331383;

    // some sort of map unit conversion?
    textureCoord /= 5.0;

    // convert from pixels to texture coords
    textureCoord.x /= gridWidth;
    textureCoord.y /= -gridHeight;

    // get a NaN (actually -Infinity) value for areas outside of texture
    if (textureCoord.y > 1.0 || textureCoord.y < 0.0 ||
        textureCoord.x > 1.0 || textureCoord.x < 0.0) {
      textureCoord = vec2(0.0, 0.5);
    }
  }
}
