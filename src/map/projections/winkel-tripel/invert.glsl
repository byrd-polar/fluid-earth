#pragma glslify: export(winkelTripel)
#pragma glslify: rotate = require(../rotate/invert.glsl)

const float halfPi = radians(90.0);

void winkelTripel(in vec2 coord, in vec2 lonLat0, out vec2 lonLat) {
  if (abs(coord.y) > halfPi || (abs(coord.x) - 1.5) + abs(coord.y) > halfPi) {
    lonLat = vec2(100, 100);
    return;
  }

  float lambda = coord.x;
  float phi = coord.y;

  for (int i = 0; i < 25; i++) {
    float cosphi = cos(phi);
    float sinphi = sin(phi);
    float sin_2phi = sin(2.0 * phi);
    float sin2phi = sinphi * sinphi;
    float cos2phi = cosphi * cosphi;
    float sinlambda = sin(lambda);
    float coslambda_2 = cos(lambda / 2.0);
    float sinlambda_2 = sin(lambda / 2.0);
    float sin2lambda_2 = sinlambda_2 * sinlambda_2;
    float C = 1.0 - cos2phi * coslambda_2 * coslambda_2;
    float F = C == 0.0 ? 0.0 : 1.0 / C;
    float E = C == 0.0 ? 0.0 : acos(cosphi * coslambda_2) * sqrt(F);
    float fx = 0.5 * (2.0 * E * cosphi * sinlambda_2 + lambda / halfPi) -
      coord.x;
    float fy = 0.5 * (E * sinphi + phi) - coord.y;
    float dxdlambda = 0.5 * F * (cos2phi * sin2lambda_2 + E * cosphi *
        coslambda_2 * sin2phi) + 0.5 / halfPi;
    float dxdphi = F * (sinlambda * sin_2phi / 4.0 - E * sinphi * sinlambda_2);
    float dydlambda = 0.125 * F * (sin_2phi * sinlambda_2 - E * sinphi * cos2phi
        * sinlambda);
    float dydphi = 0.5 * F * (sin2phi * coslambda_2 + E * sin2lambda_2 * cosphi)
      + 0.5;
    float denominator = dxdphi * dydlambda - dydphi * dxdlambda;
    lambda -= (fy * dxdphi - fx * dydphi) / denominator;
    phi -= (fx * dydlambda - fy * dxdlambda) / denominator;
  }

  lonLat = vec2(lambda, phi);

  rotate(lonLat0, lonLat);
}
