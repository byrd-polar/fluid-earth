#version 300 es
// webgl2-only version of gridded.frag, used for better NaN detection in
// fragment shader (colormap2.frag) as versions have to match

in vec2 a_position;
out vec2 v_position;

void main() {
  v_position = a_position;
  gl_Position = vec4(a_position, 0, 1);
}
