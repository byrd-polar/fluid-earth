#pragma glslify: export(orthographic)

void orthographic(in vec2 coord, in vec2 lonLat0, out vec2 lonLat) {
  float rho = sqrt(pow(coord.x, 2.0) + pow(coord.y, 2.0));
  if (rho == 0.0) {
    lonLat = lonLat0;
    return;
  }
  float c = asin(rho);

  float lon0 = lonLat0.x;
  float lat0 = lonLat0.y;

  float x = coord.x * sin(c);
  float y = rho * cos(c) * cos(lat0) - coord.y * sin(c) * sin(lat0);

  lonLat.x = lon0 + atan(x, y);
  lonLat.y = asin(cos(c) * sin(lat0) + coord.y * sin(c) * cos(lat0) / rho);
}
