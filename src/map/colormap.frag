#version 300 es
// Fragment shader for "coloring data": converting data to gridded texture using
// colormap texture

precision highp float;
precision highp int;
precision highp sampler2D;

uniform sampler2D u_data;
uniform sampler2D u_colormap;
uniform float u_colormapN;
uniform vec2 u_domain;
uniform int u_scale;
uniform vec4 u_baseColor;

in vec2 v_position;
out vec4 color;

void main() {
  float value = texture(u_data, (v_position + 1.0) / 2.0).r;

  // Check for -Infinities and use a consistent color for them
  // (not using NaN because of lack of support in some implementations)
  if (isinf(value)) {
    color = u_baseColor;
    return;
  }

  float t;

  // linear
  if (u_scale == 0) {
    t = (value - u_domain.x) / (u_domain.y - u_domain.x);
  }
  // logarithmic
  else if (u_scale == 1) {
    t = (log(value) - log(u_domain.x)) / (log(u_domain.y) - log(u_domain.x));
  }

  t = clamp(t, 0.0, 1.0);

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

  color = texture(u_colormap, vec2(tOffset, 0));
}
