#pragma glslify: export(decodeFromRGBA)

const vec4 bitPlaces = vec4(
  pow(256.0, 4.0),
  pow(256.0, 3.0),
  pow(256.0, 2.0),
  pow(256.0, 1.0)
);

float decodeFromRGBA(in vec4 rgba, in float scale, in float off) {
  vec4 integers = floor(255.0 * rgba + 0.5);
  return scale * dot(integers, 1.0 / bitPlaces) + off;
}
