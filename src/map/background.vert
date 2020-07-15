attribute vec2 a_position;
varying vec2 v_textureCoord;
 
void main() {
  // convert from clip space coords to texture coords, which also needs a y-axis
  // flip for some reason?
  v_textureCoord = (a_position + vec2(1, 1)) / vec2(2, 2) * vec2(1, -1);
  gl_Position = vec4(a_position, 0, 1);
}
