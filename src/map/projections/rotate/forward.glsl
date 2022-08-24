#pragma glslify: export(rotate)

const float PI = radians(180.0);

// Rotates longitude/latitude points on a sphere so that lonLat0 becomes the
// center where (0,0) was and rest of the points follow accordingly
//
// based on https://gis.stackexchange.com/questions/10808/manually-transforming-rotated-lat-lon-to-regular-lat-lon
void rotate(in vec2 lonLat0, inout vec2 lonLat) {
  if (lonLat0.y == 0.0) {
    lonLat.x -= lonLat0.x;
    lonLat.x = mod(lonLat.x + PI, 2.0 * PI) - PI;
    return;
  }

  vec3 xyzCoord = vec3(
    cos(lonLat.x) * cos(lonLat.y),
    sin(lonLat.x) * cos(lonLat.y),
    sin(lonLat.y)
  );
  mat3 rotateLongitude = mat3(
    cos(lonLat0.x), -sin(lonLat0.x), 0, // first column, not row!
    sin(lonLat0.x),  cos(lonLat0.x), 0,
    0,               0,              1
  );
  mat3 rotateLatitude = mat3(
    cos(lonLat0.y), 0, -sin(lonLat0.y),
    0,              1,  0,
    sin(lonLat0.y), 0,  cos(lonLat0.y)
  );
  xyzCoord = rotateLatitude * rotateLongitude * xyzCoord;

  lonLat = vec2(atan(xyzCoord.y, xyzCoord.x), asin(xyzCoord.z));
}
