#version 300 es
// Copied from ../draw.vert, modified to read RGBA instead of float textures

#pragma glslify: forwardProject = require(../../projections/forward.glsl)

#pragma glslify: decode = require(./decode.glsl)
#pragma glslify: MAX_SPEED = require(./speed.glsl)

in vec2 a_particleIndex;

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
uniform bool u_translateY;

uniform float u_size;

out float v_clip;
out float v_speed;

const float PI_2 = radians(90.0);

const vec2 DIM = vec2(360.0, 180.0); // size of map in longitude and latitude
const vec2 DIM_2 = vec2(180.0, 90.0);

void main() {
  // see gridded.frag for details
  vec2 displayCoord;
  vec2 lonLat0 = radians(vec2(u_lon0, u_lat0));

  vec2 texCoord = a_particleIndex / u_particleCountSqrt;
  vec2 lonLat = radians(vec2(
    decode(texture(u_particleLongitudes, texCoord), DIM.x, -DIM_2.x),
    decode(texture(u_particleLatitudes, texCoord), DIM.y, -DIM_2.y)
  ));
  v_speed = decode(texture(u_particleSpeeds, texCoord), MAX_SPEED, 0.0);

  bool clip; // true if vertex will not be rendered

  forwardProject(
      displayCoord,
      lonLat0,
      lonLat,
      clip,
      u_zoom,
      u_projection,
      u_translateY
  );

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
