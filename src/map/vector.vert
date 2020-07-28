// Vertex shader for the vector data layer

attribute vec2 a_latLon;

void main() {
  gl_Position = vec4(a_latLon / 180.0, 0, 1);
}
