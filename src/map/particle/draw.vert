#version 300 es
// Vertex shader for the particle data layer, essentially the same as the vertex
// shader for the vector layer

precision highp isampler2D;

#pragma glslify: forwardProject = require(../projections/forward.glsl)

in vec2 a_particleIndex;
uniform isampler2D u_particlePositions;
uniform float u_particleCountSqrt;

uniform float u_canvasRatio;
uniform float u_screenRatio;
uniform float u_lon0;
uniform float u_lat0;
uniform float u_zoom;
uniform int u_projection;
uniform bool u_translateY;

uniform float u_size;

out float v_clip;
out float v_speed;

const float PI_2 = radians(90.0);

void main() {
  // see gridded.frag for details
  vec2 displayCoord;
  vec2 lonLat0 = radians(vec2(u_lon0, u_lat0));

  vec2 texCoord = a_particleIndex / u_particleCountSqrt;
  vec4 data = intBitsToFloat(texture(u_particlePositions, texCoord));
  vec2 lonLat = radians(data.rg);
  v_speed = data.a;

  bool clip; // true if vertex will not be rendered

  forwardProject(
      displayCoord,
      lonLat0,
      lonLat,
      clip,
      u_zoom,
      u_projection,
      u_translateY
  );

  if (clip) {
    v_clip = 1.0;
  } else {
    v_clip = 0.0;
  }

  displayCoord = u_zoom * displayCoord / PI_2;
  displayCoord.x = displayCoord.x / u_canvasRatio;

  gl_PointSize = u_size * u_zoom * u_screenRatio;
  gl_Position = vec4(displayCoord, 0, 1);
}
