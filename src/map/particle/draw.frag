// Fragment shader for the particle data layer
// makes particles round instead of squares

precision mediump float;

uniform vec4 u_color;
uniform float u_opacitySpeedDecay;
varying float v_clip;
varying float v_speed;

void main() {
  if (v_clip > 0.0 || length(gl_PointCoord - vec2(0.5)) > 0.5) {
    discard;
  }
  gl_FragColor = u_color;
  gl_FragColor.a *= 1.0 - pow(u_opacitySpeedDecay, v_speed);
}
