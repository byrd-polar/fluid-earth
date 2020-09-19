#pragma glslify: export(verticalPerspective)

const float PI = radians(180.0);
const float FOV_SCALAR = 7.0; // see comment in ./forward.glsl

void verticalPerspective(
    in vec2 coord,
    in vec2 lonLat0,
    out vec2 lonLat,
    in float zoom
) {

  float rho2 = pow(coord.x, 2.0) + pow(coord.y, 2.0);
  float rho = sqrt(rho2);
  if (rho == 0.0) {
    lonLat = lonLat0;
    return;
  }
  float P = 1.0 + (FOV_SCALAR / zoom);

  // from https://github.com/d3/d3-geo-projection/blob/master/src/satellite.js
  float squaredVal = 1.0 - rho2 * (P + 1.0) / (P - 1.0);
  float sinc = (P - sqrt(squaredVal)) / ((P - 1.0) / rho + rho / (P - 1.0));

  // avoid creating NaNs (or clamping, in case of Android) in asin function
  // and avoid taking sqrt of negative number
  if (sinc > 1.0 || squaredVal < 0.0) {
    lonLat = vec2(100, 100); // intentionally out of render range
    return;
  }
  float c = asin(sinc);

  float lon0 = lonLat0.x;
  float lat0 = lonLat0.y;

  float x = coord.x * sin(c);
  float y = rho * cos(c) * cos(lat0) - coord.y * sin(c) * sin(lat0);

  lonLat.x = lon0 + atan(x, y);
  lonLat.y = asin(cos(c) * sin(lat0) + coord.y * sin(c) * cos(lat0) / rho);

  // prevent textureCoord.x from overflowing by keeping longitude in [-PI, PI]
  lonLat.x = mod(lonLat.x + PI, 2.0 * PI) - PI;
}
