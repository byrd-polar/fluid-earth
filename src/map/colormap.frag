// Fragment shader for colormaps

precision mediump float;

uniform sampler2D u_data;
uniform sampler2D u_colormap;
uniform float u_colormapN;
uniform vec2 u_domain;

varying vec2 v_position;

void main() {
  float value = texture2D(u_data, (v_position + 1.0) / 2.0).a;
  float t = clamp((value - u_domain.x) / (u_domain.y - u_domain.x), 0.0, 1.0);
  float tOffset = (u_colormapN - 1.0) / u_colormapN * (t - 0.5) + 0.5;

  gl_FragColor = texture2D(u_colormap, vec2(tOffset, 0));
}
