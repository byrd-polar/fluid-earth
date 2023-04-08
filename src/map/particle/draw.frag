#version 300 es
// Fragment shader for the particle data layer
// makes particles round instead of squares

precision highp float;

uniform vec4 u_color;
uniform float u_opacitySpeedDecay;
in float v_clip;
in float v_speed;
out vec4 color;

void main() {
  if (v_clip > 0.0 || length(gl_PointCoord - vec2(0.5)) > 0.5) {
    discard;
  }
  color = u_color;
  color.a *= 1.0 - pow(u_opacitySpeedDecay, v_speed);
}
