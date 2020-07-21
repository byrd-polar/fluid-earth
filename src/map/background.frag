precision mediump float;

#pragma glslify: equirectangular = require(./projections/equirectangular.glsl)
#pragma glslify: mercator = require(./projections/mercator.glsl)
#pragma glslify: equalEarth = require(./projections/equalEarth.glsl)
#pragma glslify: orthographic = require(./projections/orthographic.glsl)

varying vec2 v_textureCoord;
varying float v_onSeam; // 1 if on seam, 0 otherwise, will be interpolated

uniform vec2 u_canvasResolution;
// using different (reference-wise) but same (value-wise) constants to avoid
// this issue without resorting to lower precision in vertex shaders:
// https://stackoverflow.com/questions/37022476/webgl-is-it-forbidden-to-bind-the-same-uniform-in-a-vertex-shader-and-fragment
uniform float u_frag_canvasRatio;
uniform float u_frag_lon0;
uniform float u_frag_lat0;
uniform float u_frag_zoom;

uniform sampler2D u_texture;

const float PI = radians(180.0);
const float PI_2 = radians(90.0);

void main() {
  vec2 textureCoord;

  // case when fragment is along the seam that corresponds to between 0.0 and
  // 1.0 in texture coordinates -- performs same calculations as in the vertex
  // shader, just on a per fragment level since we no longer can rely on
  // interpolation between vertices for accurate texture coordinates
  if (v_onSeam > 0.0) {
    // convert to "display" coordinates (see explanation of convention in
    // background.vert)
    vec2 position = 2.0 * gl_FragCoord.xy / u_canvasResolution - 1.0;
    vec2 displayCoord = vec2(u_frag_canvasRatio * PI_2, PI_2) * position;
    displayCoord = displayCoord / vec2(u_frag_zoom, u_frag_zoom);

    // apply map projection inverse
    vec2 lonLat;
    vec2 lonLat0 = radians(vec2(u_frag_lon0, u_frag_lat0));
    orthographic(displayCoord, lonLat0, lonLat);

    // keep lat/lon in range
    lonLat.x = mod(lonLat.x + PI, 2.0 * PI) - PI;
    lonLat.y = mod(lonLat.y + PI_2, PI) - PI_2;

    // flip image vertically, for some reason
    lonLat = lonLat * vec2(1, -1);

    // convert to texture coordinates
    textureCoord = (lonLat + vec2(PI, PI_2)) / vec2(2.0 * PI, PI);
  } else {
    textureCoord = v_textureCoord;
  }

  if (textureCoord.x <= 1.0 &&
      textureCoord.x >= 0.0 &&
      textureCoord.y <= 1.0 &&
      textureCoord.y >= 0.0) {
    gl_FragColor = texture2D(u_texture, textureCoord);
  } else {
    gl_FragColor = vec4(0, 0, 0, 0); // transparent
  }
}
