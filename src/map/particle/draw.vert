// Vertex shader for the particle data layer
//
// essentially the same as the vertex shader for the vector layer

#pragma glslify: p0 = require(../projections/equirectangular/forward.glsl)
#pragma glslify: p1 = require(../projections/mercator/forward.glsl)
#pragma glslify: p2 = require(../projections/equal-earth/forward.glsl)
#pragma glslify: p3 = require(../projections/orthographic/forward.glsl)

attribute vec2 a_particleIndex;
uniform sampler2D u_particlePositions;
uniform float u_particleCountSqrt;

uniform float u_canvasRatio;
uniform float u_lon0;
uniform float u_lat0;
uniform float u_zoom;
uniform int u_projection;

varying float v_clip;
varying float v_speed;

const float PI_2 = radians(90.0);

void main() {
  // see gridded.frag for details
  vec2 displayCoord;
  vec2 lonLat0 = radians(vec2(u_lon0, u_lat0));

  vec2 texCoord = a_particleIndex / u_particleCountSqrt;
  vec4 data = texture2D(u_particlePositions, texCoord);
  vec2 lonLat = radians(data.rg);
  v_speed = data.a;

  bool clip; // true if vertex will not be rendered

  if (u_projection == 0) {
    p0(displayCoord, lonLat0, lonLat, clip);
  } else if (u_projection == 1) {
    p1(displayCoord, lonLat0, lonLat, clip);
  } else if (u_projection == 2) {
    p2(displayCoord, lonLat0, lonLat, clip);
  } else if (u_projection == 3) {
    p3(displayCoord, lonLat0, lonLat, clip);
  }

  // determines if fragment shader should not render line to avoid lines
  // wrapping across the map from the anti-meridian or map edge
  if (clip) {
    v_clip = 1.0;
  } else {
    v_clip = 0.0;
  }

  displayCoord = u_zoom * displayCoord / PI_2;
  displayCoord.x = displayCoord.x / u_canvasRatio;

  gl_PointSize = pow(u_zoom, 0.8);
  gl_Position = vec4(displayCoord, 0, 1);
}
