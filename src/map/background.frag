precision mediump float;
varying vec2 v_textureCoord;
uniform sampler2D u_texture;

void main() {
  gl_FragColor = texture2D(u_texture, v_textureCoord);
}
