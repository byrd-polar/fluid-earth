#version 300 es
// Fragment shader for the gridded data layer

precision highp float;
precision highp int;
precision highp sampler2D;

#pragma glslify: invertProject = require(./projections/invert.glsl)
#pragma glslify: projectToTexture = require(./data-projections/)

uniform float u_canvasRatio;
uniform float u_lon0;
uniform float u_lat0;
uniform float u_zoom;
uniform int u_projection;
uniform bool u_translateY;
uniform int u_griddedDataProjection;

uniform sampler2D u_texture0;
uniform sampler2D u_texture1;
uniform sampler2D u_texture2;
uniform sampler2D u_texture3;
uniform sampler2D u_texture4;
uniform sampler2D u_texture5;
uniform sampler2D u_texture6;
uniform sampler2D u_texture7;
uniform sampler2D u_texture8;
uniform sampler2D u_texture9;
uniform sampler2D u_texture10;
uniform sampler2D u_texture11;
uniform sampler2D u_texture12;
uniform sampler2D u_texture13;
uniform sampler2D u_texture14;
uniform sampler2D u_texture15;

uniform int u_gridWidth;
uniform int u_gridHeight;
uniform int u_maxTextureSize;
uniform int u_textureBatchNumber;

in vec2 v_position;
out vec4 color;

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

  invertProject(
      displayCoord,
      lonLat0,
      lonLat,
      u_zoom,
      u_projection,
      u_translateY
  );

  // don't render points with lonLat out of range
  if ( lonLat.x >  PI
    || lonLat.x < -PI
    || lonLat.y >  PI_2
    || lonLat.y < -PI_2
  ) {
    color = vec4(0, 0, 0, 0); // transparent
    return;
  }

  vec2 textureCoord;
  projectToTexture(
      textureCoord,
      lonLat,
      float(u_gridWidth),
      float(u_gridHeight),
      u_griddedDataProjection
  );

  if (u_gridWidth <= u_maxTextureSize && u_gridHeight <= u_maxTextureSize) {
    color = texture(u_texture0, textureCoord);
    return;
  }

  int r = int(textureCoord.y * float(u_gridHeight));
  int c = int(textureCoord.x * float(u_gridWidth));
  int idx = r * u_gridWidth + c;

  int row = idx / u_maxTextureSize;
  int col = idx - row * u_maxTextureSize;

  int texNum = row / u_maxTextureSize;
  ivec2 coord = ivec2(col, row - texNum * u_maxTextureSize);

  texNum -= u_textureBatchNumber * 16;

  if (texNum == 0) {
    color = texelFetch(u_texture0, coord, 0);
  } else if (texNum == 1)  {
    color = texelFetch(u_texture1, coord, 0);
  } else if (texNum == 2)  {
    color = texelFetch(u_texture2, coord, 0);
  } else if (texNum == 3)  {
    color = texelFetch(u_texture3, coord, 0);
  } else if (texNum == 4)  {
    color = texelFetch(u_texture4, coord, 0);
  } else if (texNum == 5)  {
    color = texelFetch(u_texture5, coord, 0);
  } else if (texNum == 6)  {
    color = texelFetch(u_texture6, coord, 0);
  } else if (texNum == 7)  {
    color = texelFetch(u_texture7, coord, 0);
  } else if (texNum == 8)  {
    color = texelFetch(u_texture8, coord, 0);
  } else if (texNum == 9)  {
    color = texelFetch(u_texture9, coord, 0);
  } else if (texNum == 10) {
    color = texelFetch(u_texture10, coord, 0);
  } else if (texNum == 11) {
    color = texelFetch(u_texture11, coord, 0);
  } else if (texNum == 12) {
    color = texelFetch(u_texture12, coord, 0);
  } else if (texNum == 13) {
    color = texelFetch(u_texture13, coord, 0);
  } else if (texNum == 14) {
    color = texelFetch(u_texture14, coord, 0);
  } else if (texNum == 15) {
    color = texelFetch(u_texture15, coord, 0);
  }
}
