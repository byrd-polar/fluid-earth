// Fragment shader for drawing a texture straight to the canvas, used in
// creating particle trails

precision mediump float;

uniform sampler2D u_texture;
uniform float u_fade;

varying vec2 v_position;

const float MIN_FADE = 512.0;

void main() {
  gl_FragColor = texture2D(u_texture, (v_position + 1.0) / 2.0);
  gl_FragColor.a = floor(MIN_FADE * gl_FragColor.a * u_fade) / MIN_FADE;
}
