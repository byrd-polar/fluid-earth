#pragma glslify: export(projectToTexture)

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
  // GEOS
  else if (projection == 3) {

    textureCoord = (lonLat + vec2(PI, PI_2)) / vec2(2.0 * PI, PI);

    float xOffset = 0.5 / gridWidth;
    float yScale = (gridHeight - 1.0) / gridHeight;

    textureCoord.x = mod(textureCoord.x + xOffset, 1.0);
    textureCoord.y = yScale * (textureCoord.y - 0.5) + 0.5;

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

    // simplied form of the general polar stereographic projection (section 9.1)
    textureCoord.x = m * sin(lonLat.x);
    textureCoord.y = -m * cos(lonLat.x);

    // following values from the .tfw file inside the .zip file at
    // https://store.pangaea.de/Publications/ObuJ-etal_2018/UiO_PEX_PERPROB_5.0_20181128_2000_2016_NH.zip
    textureCoord.x -= -10389109.8424841110;
    textureCoord.y -= 9199572.4044017550;
    textureCoord /= 926.6254331383;

    // switch from 1 km scale (.tfw file above) to 5 or 10 km scale (.nc file)
    textureCoord /= (gridWidth == 4485.0) ? 5.0 : 10.0;

    // convert from pixels to texture coords
    textureCoord.x /= gridWidth;
    textureCoord.y /= -gridHeight;

    // get a NaN (actually -Infinity) value for areas outside of texture
    if (textureCoord.y > 1.0 || textureCoord.y < 0.0 ||
        textureCoord.x > 1.0 || textureCoord.x < 0.0) {
      textureCoord = vec2(0.0, 0.5);
    }
  }
  // OSCAR2
  else if (projection == 5) {
    textureCoord.x = (lonLat.y + PI_2) / PI;
    textureCoord.y = lonLat.x / (2.0 * PI);

    float xScale = (gridWidth + 1.0) / gridWidth;
    float yOffset = 0.5 / gridHeight;

    textureCoord.x = xScale * (textureCoord.x - 0.5) + 0.5;
    textureCoord.y = mod(textureCoord.y + yOffset, 1.0);
  }
}
