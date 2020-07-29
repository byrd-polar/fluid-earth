#pragma glslify: export(rotate)

const float PI = radians(180.0);

// Rotates longitude/latitude points on a sphere so that lonLat0 becomes the
// center where (0,0) was and rest of the points follow accordingly
//
// based on https://gis.stackexchange.com/questions/10808/manually-transforming-rotated-lat-lon-to-regular-lat-lon
//
// clips coordinate if it is too close to edge of rotated area to prevent lines
// from wrapping across map
void rotate(in vec2 lonLat0, inout vec2 lonLat, out bool clip) {
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

  float distanceFromMeridian = abs(lonLat.x);
  clip = distanceFromMeridian > PI - radians(1.0);
}
