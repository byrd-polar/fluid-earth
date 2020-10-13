// Copied from ../draw.vert, modified to read RGBA instead of float textures

#pragma glslify: p0 = require(../../projections/equirectangular/forward.glsl)
#pragma glslify: p1 = require(../../projections/mercator/forward.glsl)
#pragma glslify: p2 = require(../../projections/equal-earth/forward.glsl)
#pragma glslify: p3 = require(../../projections/orthographic/forward.glsl)
#pragma glslify: p4 = require(../../projections/vertical-perspective/forward.glsl)

#pragma glslify: decode = require(./decode.glsl)
#pragma glslify: MAX_SPEED = require(./speed.glsl)

attribute vec2 a_particleIndex;

uniform sampler2D u_particleLongitudes;
uniform sampler2D u_particleLatitudes;
uniform sampler2D u_particleSpeeds;

uniform float u_particleCountSqrt;

uniform float u_canvasRatio;
uniform float u_screenRatio;
uniform float u_lon0;
uniform float u_lat0;
uniform float u_zoom;
uniform int u_projection;

uniform float u_size;

varying float v_clip;
varying float v_speed;

const float PI_2 = radians(90.0);

const vec2 DIM = vec2(360.0, 180.0); // size of map in longitude and latitude
const vec2 DIM_2 = vec2(180.0, 90.0);

void main() {
  // see gridded.frag for details
  vec2 displayCoord;
  vec2 lonLat0 = radians(vec2(u_lon0, u_lat0));

  vec2 texCoord = a_particleIndex / u_particleCountSqrt;
  vec2 lonLat = radians(vec2(
    decode(texture2D(u_particleLongitudes, texCoord), DIM.x, -DIM_2.x),
    decode(texture2D(u_particleLatitudes, texCoord), DIM.y, -DIM_2.y)
  ));
  v_speed = decode(texture2D(u_particleSpeeds, texCoord), MAX_SPEED, 0.0);

  bool clip; // true if vertex will not be rendered

  if (u_projection == 0) {
    p0(displayCoord, lonLat0, lonLat, clip);
  } else if (u_projection == 1) {
    p1(displayCoord, lonLat0, lonLat, clip);
  } else if (u_projection == 2) {
    p2(displayCoord, lonLat0, lonLat, clip);
  } else if (u_projection == 3) {
    p3(displayCoord, lonLat0, lonLat, clip);
  } else if (u_projection == 4) {
    p4(displayCoord, lonLat0, lonLat, clip, u_zoom);
  }

  // determines if fragment shader should not render line to avoid lines
  // wrapping across the map from the anti-meridian or map edge
  if (clip) {
    v_clip = 1.0;
  } else {
    v_clip = 0.0;
  }

  displayCoord = u_zoom * displayCoord / PI_2;
  displayCoord.x = displayCoord.x / u_canvasRatio;

  gl_PointSize = u_size * u_zoom * u_screenRatio;
  gl_Position = vec4(displayCoord, 0, 1);
}
