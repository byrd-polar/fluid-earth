// Fragment shader for the gridded data layer

precision highp float;

#pragma glslify: p0 = require(./projections/equirectangular/invert.glsl)
#pragma glslify: p1 = require(./projections/mercator/invert.glsl)
#pragma glslify: p2 = require(./projections/equal-earth/invert.glsl)
#pragma glslify: p3 = require(./projections/orthographic/invert.glsl)
#pragma glslify: p4 = require(./projections/vertical-perspective/invert.glsl)
#pragma glslify: p5 = require(./projections/stereographic/invert.glsl)

#pragma glslify: projectToTexture = require(./data-projections/)

uniform float u_canvasRatio;
uniform float u_lon0;
uniform float u_lat0;
uniform float u_zoom;
uniform int u_projection;
uniform int u_griddedDataProjection;
uniform bool u_offsetGridded;

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
  } else if (u_projection == 4) {
    p4(displayCoord, lonLat0, lonLat, u_zoom);
  } else if (u_projection == 5) {
    p5(displayCoord, lonLat0, lonLat);
  }

  // don't render points with lonLat out of range
  if (lonLat.x >  PI ||
      lonLat.x < -PI ||
      lonLat.y >  PI_2 ||
      lonLat.y < -PI_2) {
    gl_FragColor = vec4(0, 0, 0, 0); // transparent
    return;
  }

  vec2 textureCoord;
  projectToTexture(
      textureCoord,
      lonLat,
      u_gridWidth,
      u_gridHeight,
      u_griddedDataProjection
  );

  gl_FragColor = texture2D(u_texture, textureCoord);
}
