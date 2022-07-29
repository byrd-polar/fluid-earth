// Vertex shader for the vector data layer

#pragma glslify: forwardProject = require(./projections/forward.glsl)

attribute vec2 a_lonLat;

uniform float u_canvasRatio;
uniform float u_lon0;
uniform float u_lat0;
uniform float u_zoom;
uniform int u_projection;
uniform bool u_translateY;

varying float v_clip;

const float PI_2 = radians(90.0);

void main() {
  // see gridded.frag for details
  vec2 displayCoord;
  vec2 lonLat0 = radians(vec2(u_lon0, u_lat0));
  vec2 lonLat = radians(a_lonLat);
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

  gl_Position = vec4(displayCoord, 0, 1);
}
