#pragma glslify: export(stereographic)
#pragma glslify: rotate = require(../rotate/forward.glsl)

void stereographic(out vec2 coord, in vec2 lonLat0, in vec2 lonLat) {
  rotate(lonLat0, lonLat);

  float cy = cos(lonLat.y);
  float k = 1.0 + cos(lonLat.x) * cy;

  coord.x = cy * sin(lonLat.x) / k;
  coord.y = sin(lonLat.y) / k;
}
