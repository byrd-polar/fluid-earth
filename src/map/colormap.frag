// Fragment shader for "coloring data": converting data to gridded texture using
// colormap texture

precision mediump float;

uniform sampler2D u_data;
uniform sampler2D u_colormap;
uniform float u_colormapN;
uniform vec2 u_domain;

varying vec2 v_position;

void main() {
  float value = texture2D(u_data, (v_position + 1.0) / 2.0).a;

  // Check for NaNs and use a consistent color for them
  if (value != value) {
    gl_FragColor = vec4(0.15, 0.15, 0.15, 1); // greyish color
    return;
  }

  float t = clamp((value - u_domain.x) / (u_domain.y - u_domain.x), 0.0, 1.0);
  float tOffset = (u_colormapN - 1.0) / u_colormapN * (t - 0.5) + 0.5;

  gl_FragColor = texture2D(u_colormap, vec2(tOffset, 0));
}
