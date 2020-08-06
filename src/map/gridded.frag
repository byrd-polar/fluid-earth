// Fragment shader for the gridded data layer

precision mediump float;

#pragma glslify: p0 = require(./projections/equirectangular/invert.glsl)
#pragma glslify: p1 = require(./projections/mercator/invert.glsl)
#pragma glslify: p2 = require(./projections/equal-earth/invert.glsl)
#pragma glslify: p3 = require(./projections/orthographic/invert.glsl)

uniform float u_canvasRatio;
uniform float u_lon0;
uniform float u_lat0;
uniform float u_zoom;
uniform int u_projection;

uniform sampler2D u_texture;
uniform float u_gridWidth;
uniform float u_gridHeight;

varying vec2 v_position;

const float PI = radians(180.0);
const float PI_2 = radians(90.0);

void main() {
  // "display" coordinates are my convention here, where they correspond to
  // points on a graph with (0,0) in the center of the canvas, which is pi units
  // high when zoom = 1 and has width units proportional to height units (unlike
  // clip coordinates)
  vec2 displayCoord = vec2(u_canvasRatio * PI_2, PI_2) * v_position;
  displayCoord = displayCoord / u_zoom;

  // longitude and latitude, respectively, in radians, where positive latitudes
  // correspond to the northern hemisphere, and positive longitudes are east of
  // the prime meridian -- these should be the outputs of the inverse map
  // projection equation for whichever projection we're currently using
  vec2 lonLat;

  // where the map is centered
  vec2 lonLat0 = radians(vec2(u_lon0, u_lat0));

  if (u_projection == 0) {
    p0(displayCoord, lonLat0, lonLat);
  } else if (u_projection == 1) {
    p1(displayCoord, lonLat0, lonLat);
  } else if (u_projection == 2) {
    p2(displayCoord, lonLat0, lonLat);
  } else if (u_projection == 3) {
    p3(displayCoord, lonLat0, lonLat);
  }

  // don't render points with lonLat out of range
  if (lonLat.x >  PI ||
      lonLat.x < -PI ||
      lonLat.y >  PI_2 ||
      lonLat.y < -PI_2) {
    gl_FragColor = vec4(0, 0, 0, 0); // transparent
    return;
  }

  // texture coordinates on an equirectangular map projection grid, where (0,0)
  // is the bottom left corner and (1,1) is the top right corner (despite the
  // grid having an aspect ratio of ~ 2:1, because that's just how textures work
  // in WebGL)
  vec2 textureCoord = (lonLat + vec2(PI, PI_2)) / vec2(2.0 * PI, PI);

  // needs to flipped vertically, since (0,0) is bottom-left, not top-left
  textureCoord.y = 1.0 - textureCoord.y;

  // offset/scale coords so it aligns accurately with given grid (grid points
  // were offset in the opposite direction earlier when texture was created)
  float xOffset = 0.5 + (0.5 / u_gridWidth);
  float yScale = (u_gridHeight - 1.0) / u_gridHeight;

  textureCoord.x = mod(textureCoord.x + xOffset, 1.0);
  textureCoord.y = yScale * (textureCoord.y - 0.5) + 0.5;

  gl_FragColor = texture2D(u_texture, textureCoord);
}
