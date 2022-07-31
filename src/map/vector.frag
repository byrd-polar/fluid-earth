#version 300 es
// Fragment shader for the vector data layer

precision mediump float;

in float v_clip;
in float v_t;
uniform vec4 u_color;
out vec4 color;

void main() {
  if (v_clip > 0.0 || fwidth(v_t) < 1e-2) {
    color = vec4(0, 0, 0, 0); // transparent
  } else {
    color = u_color;
  }
}
