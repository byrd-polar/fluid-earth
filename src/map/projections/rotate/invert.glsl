#pragma glslify: export(rotate)

// Rotates longitude/latitude points on a sphere so that lonLat0 becomes the
// center where (0,0) was and rest of the points follow accordingly
//
// based on https://gis.stackexchange.com/questions/10808/manually-transforming-rotated-lat-lon-to-regular-lat-lon
void rotate(in vec2 lonLat0, inout vec2 lonLat) {
  vec3 xyzCoord = vec3(
    cos(lonLat.x) * cos(lonLat.y),
    sin(lonLat.x) * cos(lonLat.y),
    sin(lonLat.y)
  );
  mat3 rotateLatitude = mat3(
    cos(-lonLat0.y), 0, -sin(-lonLat0.y), // first column, not row!
    0,               1,  0,
    sin(-lonLat0.y), 0,  cos(-lonLat0.y)
  );
  xyzCoord = rotateLatitude * xyzCoord;

  lonLat = vec2(atan(xyzCoord.y, xyzCoord.x), asin(xyzCoord.z));
  lonLat.x += lonLat0.x;
}
