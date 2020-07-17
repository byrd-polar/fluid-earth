attribute vec2 a_position;

uniform float u_canvasRatio;
uniform float u_lon0;
uniform float u_lat0;
uniform float u_zoom;

varying vec2 v_textureCoord;

const float PI = radians(180.0);
const float PI_2 = radians(90.0);

void mercator(in vec2 coord, out vec2 lonLat) {
  lonLat.x = coord.x;
  lonLat.y = 2.0 * atan(exp(coord.y)) - radians(90.0);
}

void equirectangular(in vec2 coord, out vec2 lonLat) {
  lonLat.x = coord.x;
  lonLat.y = coord.y;
}

void orthographic(in vec2 coord, out vec2 lonLat) {
  float rho = sqrt(pow(coord.x, 2.0) + pow(coord.y, 2.0));
  float c = asin(rho);

  lonLat.x = u_lon0 + atan(
      coord.x * sin(c),
      rho * cos(c) * cos(u_lat0) - coord.y * sin(c) * sin(u_lat0)
  );
  lonLat.y = asin(cos(c) * sin(u_lat0) + coord.y * sin(c) * cos(u_lat0) / rho);
}

void main() {
  // "display" coordinates are my convention here, where they correspond to
  // points on a graph with (0,0) in the center of the canvas, which is pi units
  // high when zoom = 1 and has width units proportional to height units (unlike
  // clip coordinates)
  vec2 displayCoord = vec2(u_canvasRatio * PI_2, PI_2) * a_position;
  displayCoord = displayCoord / vec2(u_zoom, u_zoom);

  // longitude and latitude, respectively, in degrees, where positive latitudes
  // correspond to the northern hemisphere, and positive longitudes are east of
  // the prime meridian -- these should be the outputs of the inverse map
  // projection equation for whichever projection we're currently using
  vec2 lonLat;
  orthographic(displayCoord, lonLat);

  // prevent textureCoord from overflowing by keeping longitude in [-PI, PI]
  // and latitude in [-PI_2, PI_2], but not necessary in many projections, may
  // be a place to improve performance?
  lonLat.x = mod(lonLat.x + PI, 2.0 * PI) - PI;
  lonLat.y = mod(lonLat.y + PI_2, PI) - PI_2;

  // also image needs to flipped vertically for some reason
  lonLat = lonLat * vec2(1, -1);

  // convert to texture coordinates on a image of a plate carrée map projection,
  // where (0,0) is the bottom left corner and (1,1) is the top right corner
  // (despite the image having an aspect ratio of 2:1, because that's just how
  // textures work in WebGL)
  v_textureCoord = (lonLat + vec2(PI, PI_2)) / vec2(2.0 * PI, PI);

  gl_Position = vec4(a_position, 0, 1);
}
