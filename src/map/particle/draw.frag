// Fragment shader for the particle data layer
// makes particles round instead of squares

precision mediump float;

uniform vec4 u_color;
varying float v_clip;

void main() {
  if (v_clip > 0.0 || length(gl_PointCoord - vec2(0.5)) > 0.5) {
    discard;
  }
  gl_FragColor = u_color;
}
