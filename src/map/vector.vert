// Vertex shader for the vector data layer

#pragma glslify: p0 = require(./projections/equirectangular/forward.glsl)
#pragma glslify: p1 = require(./projections/mercator/forward.glsl)
#pragma glslify: p2 = require(./projections/equal-earth/forward.glsl)
#pragma glslify: p3 = require(./projections/orthographic/forward.glsl)

attribute vec2 a_latLon;

uniform float u_canvasRatio;
uniform float u_lon0;
uniform float u_lat0;
uniform float u_zoom;
uniform int u_projection;

const float PI_2 = radians(90.0);

void main() {
  // see gridded.frag for details
  vec2 displayCoord;
  vec2 latLon0 = radians(vec2(u_lon0, u_lat0));
  vec2 latLon = radians(a_latLon);
  bool clip; // true if vertex will not be rendered

  if (u_projection == 0) {
    p0(displayCoord, latLon0, latLon, clip);
  } else if (u_projection == 1) {
    p1(displayCoord, latLon0, latLon, clip);
  } else if (u_projection == 2) {
    p2(displayCoord, latLon0, latLon, clip);
  } else if (u_projection == 3) {
    p3(displayCoord, latLon0, latLon, clip);
  }

  if (clip) {
    return; // not assigning to gl_Position skips rendering of point?
  }

  displayCoord = u_zoom * displayCoord / PI_2;
  displayCoord.x = displayCoord.x / u_canvasRatio;

  gl_Position = vec4(displayCoord, 0, 1);
}
