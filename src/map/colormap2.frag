#version 300 es
// webgl2-only version of colormap.frag, used for better NaN detection

precision mediump float;

uniform sampler2D u_data;
uniform sampler2D u_colormap;
uniform float u_colormapN;
uniform vec2 u_domain;

in vec2 v_position;
out vec4 outputColor;

void main() {
  float value = texture(u_data, (v_position + 1.0) / 2.0).r;

  // Check for NaNs and use a consistent color for them
  if (isnan(value)) {
    outputColor = vec4(0.15, 0.15, 0.15, 1); // greyish color
    return;
  }

  float t = clamp((value - u_domain.x) / (u_domain.y - u_domain.x), 0.0, 1.0);
  float tOffset = (u_colormapN - 1.0) / u_colormapN * (t - 0.5) + 0.5;

  outputColor = texture(u_colormap, vec2(tOffset, 0));
}
