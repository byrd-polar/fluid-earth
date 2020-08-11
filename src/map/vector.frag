// Fragment shader for the vector data layer

precision mediump float;

uniform vec4 u_color;
varying float v_clip;

void main() {
  if (v_clip > 0.0) {
    gl_FragColor = vec4(0, 0, 0, 0); // transparent
  } else {
    gl_FragColor = u_color;
  }
}
