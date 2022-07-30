#version 300 es
// Copied from ../step.frag, with parts not relating to lifetime step removed
precision highp float;

#pragma glslify: encode = require(./encode.glsl)
#pragma glslify: decode = require(./decode.glsl)

uniform sampler2D u_particleLifetimes;

uniform float u_particleLifetime;
uniform float u_timeDelta;

in vec2 v_position;
out vec4 color;

void main() {
  vec2 id = (v_position + 1.0) / 2.0; // 2D "id" in between (0,0) and (1,1)
  float lifetime = decode(texture2D(u_particleLifetimes, id),
      u_particleLifetime, 0.0);
  lifetime += u_timeDelta;

  if (lifetime > u_particleLifetime) {
    lifetime -= u_particleLifetime;
  }

  color = encode(lifetime, u_particleLifetime, 0.0);
}
