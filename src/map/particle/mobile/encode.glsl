#pragma glslify: export(encodeToRGBA)

vec4 encodeToRGBA(in float value, in float scale, in float off) {
  float normalizedVal = (value - off) / scale;

  vec4 rgba;
  float v = normalizedVal;

  v *= 256.0;
  rgba.a = floor(v);
  v = fract(v);

  v *= 256.0;
  rgba.b = floor(v);
  v = fract(v);

  v *= 256.0;
  rgba.g = floor(v);
  v = fract(v);

  v *= 256.0;
  rgba.r = floor(v + 0.5);

  return rgba / 255.0;
}
