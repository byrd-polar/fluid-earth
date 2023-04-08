#version 300 es
// Fragment shader for the vector data layer

precision highp float;

in float v_clip;
in float v_t;
uniform vec4 u_color;
out vec4 color;

void main() {
  color = v_clip > 0.0 || fwidth(v_t) < 1e-2
    ? vec4(0, 0, 0, 0) // transparent
    : u_color;
}
