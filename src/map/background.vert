attribute vec2 a_position;

uniform float u_canvasRatio;
uniform float u_imageRatio;

varying vec2 v_textureCoord;
 
void main() {
  // convert from clip space coords to texture coords, which also needs a y-axis
  // flip for some reason?
  v_textureCoord = (a_position + vec2(1, 1)) / vec2(2, -2);

  // ensure image aspect ratio is preserved and image is centered along
  // horizontal axis
  float hStretch = u_canvasRatio / u_imageRatio;
  vec2 hOffset = vec2((1.0 - hStretch) / 2.0, 0);
  v_textureCoord = vec2(hStretch, 1) * v_textureCoord + hOffset;

  gl_Position = vec4(a_position, 0, 1);
}
