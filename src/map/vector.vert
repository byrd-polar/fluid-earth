// Vertex shader for the vector data layer

#pragma glslify: p2 = require(./projections/equal-earth/forward.glsl)
#pragma glslify: p3 = require(./projections/orthographic/forward.glsl)

attribute vec2 a_latLon;

uniform float u_canvasRatio;
uniform float u_lon0;
uniform float u_lat0;
uniform float u_zoom;

const float PI_2 = radians(90.0);

void main() {
  vec2 position;
  vec2 latLon0 = radians(vec2(u_lon0, u_lat0));
  bool clip = false;

  p2(position, latLon0, radians(a_latLon));

  if (clip) {
    return; // not assigning to gl_Position skips rendering of point?
  }

  position = u_zoom * position / PI_2;
  position.x = position.x / u_canvasRatio;

  gl_Position = vec4(position, 0, 1);
}
