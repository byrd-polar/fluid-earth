attribute vec2 a_position;

uniform float u_canvasRatio;

varying vec2 v_textureCoord;

void main() {

  // "display" coordinates are my convention here, where they correspond to
  // points on a graph with (0,0) in the center of the canvas, which is 2 units
  // high when zoom = 1 and has width units proportional to height units (unlike
  // clip coordinates)
  float zoom = 1.0;
  vec2 displayCoord = vec2(u_canvasRatio, 1) * a_position;
  displayCoord = displayCoord / vec2(zoom, zoom);

  // longitude and latitude, respectively, in degrees, where positive latitudes
  // correspond to the northern hemisphere, and positive longitudes are east of
  // the prime meridian -- these should be the outputs of the inverse map
  // projection equation for whichever projection we're currently using
  vec2 lonLat = vec2(90, 90) * displayCoord;

  // convert to texture coordinates on a image of a plate carrée map projection,
  // where (0,0) is the bottom left corner and (1,1) is the top right corner
  // (despite the image having an aspect ratio of 2:1, because that's just how
  // textures work in WebGL)
  v_textureCoord = (lonLat + vec2(180, 90)) / vec2(360, 180);

  // also image needs to flipped vertically for some reason
  v_textureCoord = vec2(1, -1) * v_textureCoord;

  gl_Position = vec4(a_position, 0, 1);
}
