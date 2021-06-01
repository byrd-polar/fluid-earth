// Fragment shader for "coloring data": converting data to gridded texture using
// colormap texture

precision mediump float;

uniform sampler2D u_data;
uniform sampler2D u_colormap;
uniform float u_colormapN;
uniform vec2 u_domain;
uniform vec4 u_baseColor;

varying vec2 v_position;

void main() {
  float value = texture2D(u_data, (v_position + 1.0) / 2.0).a;

  // Check for -Infinities and use a consistent color for them
  // (not using NaN because of lack of support in some implementations)
  if (value < -1e99) {
    gl_FragColor = u_baseColor;
    return;
  }

  float t = clamp((value - u_domain.x) / (u_domain.y - u_domain.x), 0.0, 1.0);

  // Converts t value to actual texture coordinate by offseting so that instead
  // of this alignment...
  //
  // |c|...|c|
  // 0       1
  //
  // we have this alignment where the endpoints are centered over the end
  // pixels.
  //
  // |c|...|c|
  //  0     1
  //
  // (the |c|s are the pixels in the u_colormap texture)
  float tOffset = (u_colormapN - 1.0) / u_colormapN * (t - 0.5) + 0.5;

  gl_FragColor = texture2D(u_colormap, vec2(tOffset, 0));
}
