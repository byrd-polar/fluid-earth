#pragma glslify: export(orthographic)

void orthographic(out vec2 coord, in vec2 lonLat0, in vec2 lonLat,
    out bool clip) {

  float c = sin(lonLat0.y) * sin(lonLat.y) +
      cos(lonLat0.y) * cos(lonLat.y) * cos(lonLat.x - lonLat0.x);

  clip = c < 0.0;

  coord.x = cos(lonLat.y) * sin(lonLat.x - lonLat0.x);
  coord.y = cos(lonLat0.y) * sin(lonLat.y) -
    sin(lonLat0.y) * cos(lonLat.y) * cos(lonLat.x - lonLat0.x);
}
