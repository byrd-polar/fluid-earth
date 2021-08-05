// Fragment shader for the gridded data layer

precision highp float;

#pragma glslify: invertProject = require(./projections/invert.glsl)
#pragma glslify: projectToTexture = require(./data-projections/)

uniform float u_canvasRatio;
uniform float u_lon0;
uniform float u_lat0;
uniform float u_zoom;
uniform int u_projection;
uniform bool u_translateY;
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

  invertProject(
      displayCoord,
      lonLat0,
      lonLat,
      u_zoom,
      u_projection,
      u_translateY
  );

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
