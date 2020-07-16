attribute vec2 a_position;

uniform float u_canvasRatio;

varying vec2 v_textureCoord;

const float PI = radians(180.0);
const float PI_2 = radians(90.0);

void mercator(in vec2 coord, out vec2 lonLat) {
  lonLat.x = coord.x;
  lonLat.y = 2.0 * atan(exp(coord.y)) - radians(90.0);
}

void equirectangular(in vec2 coord, out vec2 lonLat) {
  float lon0 = radians(0.0);
  float lat0 = radians(0.0);
  lonLat.x = coord.x / cos(lat0) + lon0;
  lonLat.y = coord.y + lat0;
}

void orthographic(in vec2 coord, out vec2 lonLat) {
  float lon0 = radians(-90.0);
  float lat0 = radians(40.0);

  float rho = sqrt(pow(coord.x, 2.0) + pow(coord.y, 2.0));
  float c = asin(rho);

  lonLat.x = lon0 + atan(
      coord.x * sin(c),
      rho * cos(c) * cos(lat0) - coord.y * sin(c) * sin(lat0)
  );
  lonLat.y = asin(cos(c) * sin(lat0) + coord.y * sin(c) * cos(lat0) / rho);
}

void main() {
  // "display" coordinates are my convention here, where they correspond to
  // points on a graph with (0,0) in the center of the canvas, which is pi units
  // high when zoom = 1 and has width units proportional to height units (unlike
  // clip coordinates)
  //
  // also image needs to flipped vertically for some reason
  float zoom = 1.0;
  vec2 displayCoord = vec2(u_canvasRatio * PI_2, -PI_2) * a_position;
  displayCoord = displayCoord / vec2(zoom, zoom);

  // longitude and latitude, respectively, in degrees, where positive latitudes
  // correspond to the northern hemisphere, and positive longitudes are east of
  // the prime meridian -- these should be the outputs of the inverse map
  // projection equation for whichever projection we're currently using
  vec2 lonLat;
  orthographic(displayCoord, lonLat);

  // convert to texture coordinates on a image of a plate carrée map projection,
  // where (0,0) is the bottom left corner and (1,1) is the top right corner
  // (despite the image having an aspect ratio of 2:1, because that's just how
  // textures work in WebGL)
  v_textureCoord = (lonLat + vec2(PI, PI_2)) / vec2(2.0 * PI, PI);

  gl_Position = vec4(a_position, 0, 1);
}
