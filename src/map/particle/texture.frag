#version 300 es
// Fragment shader for drawing a texture straight to the canvas, used in
// creating particle trails

precision highp float;
precision highp sampler2D;

uniform sampler2D u_texture;
uniform float u_fade;

in vec2 v_position;
out vec4 color;

const float MIN_FADE = 512.0;

void main() {
  color = texture(u_texture, (v_position + 1.0) / 2.0);
  color.a = floor(MIN_FADE * color.a * u_fade) / MIN_FADE;
}
