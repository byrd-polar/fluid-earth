#pragma glslify: export(verticalPerspective)

// Affects the field of view in some way, too lazy to find the exact
// relationship for now. Larger values -> more of globe is visible (tends
// towards the orthographic projection at infinity). Also determines
// relationship between actual altitude value and our arbitrary zoom value.
const float FOV_SCALAR = 7.0;

void verticalPerspective(
    out vec2 coord,
    in vec2 lonLat0,
    in vec2 lonLat,
    out bool clip,
    in float zoom
) {

  float c = sin(lonLat0.y) * sin(lonLat.y) +
    cos(lonLat0.y) * cos(lonLat.y) * cos(lonLat.x - lonLat0.x);

  float P = 1.0 + (FOV_SCALAR / zoom);
  float k = (P - 1.0) / (P - c);

  clip = c < 1.0 / P;

  coord.x = k * cos(lonLat.y) * sin(lonLat.x - lonLat0.x);
  coord.y = k * (cos(lonLat0.y) * sin(lonLat.y) -
    sin(lonLat0.y) * cos(lonLat.y) * cos(lonLat.x - lonLat0.x));
}
