precision mediump float;
varying vec2 v_textureCoord;
uniform sampler2D u_texture;

void main() {
  if (v_textureCoord.x <= 1.0 &&
      v_textureCoord.x >= 0.0 &&
      v_textureCoord.y <= 1.0 &&
      v_textureCoord.y >= 0.0) {
    gl_FragColor = texture2D(u_texture, v_textureCoord);
  } else {
    gl_FragColor = vec4(0, 0, 0, 0); // transparent
  }
}
