#version 300 es
// Copied from ../step.frag, with parts not relating to latitude step removed
precision highp float;

#pragma glslify: encode = require(./encode.glsl)
#pragma glslify: decode = require(./decode.glsl)

#pragma glslify: projectToTexture = require(../../data-projections/)

uniform sampler2D u_particleLongitudes;
uniform sampler2D u_particleLatitudes;
uniform sampler2D u_particleLifetimes;
uniform sampler2D u_vectorFieldV;
uniform sampler2D u_random;

uniform vec2 u_randLonLatOffsets;

uniform float u_gridWidth;
uniform float u_gridHeight;
uniform int u_particleDataProjection;

uniform float u_particleLifetime;
uniform float u_timeDelta;
uniform float u_rate;

in vec2 v_position;
out vec4 color;

const vec2 DIM = vec2(360.0, 180.0); // size of map in longitude and latitude
const vec2 DIM_2 = vec2(180.0, 90.0);

const float M_PER_DEG = 111319.5;

void main() {
  vec2 id = (v_position + 1.0) / 2.0; // 2D "id" in between (0,0) and (1,1)
  vec2 lonLat = vec2(
    decode(texture(u_particleLongitudes, id), DIM.x, -DIM_2.x),
    decode(texture(u_particleLatitudes, id), DIM.y, -DIM_2.y)
  );
  float lifetime = decode(texture(u_particleLifetimes, id),
      u_particleLifetime, 0.0);
  lifetime += u_timeDelta;

  vec2 textureCoord;
  projectToTexture(
      textureCoord,
      radians(lonLat),
      u_gridWidth,
      u_gridHeight,
      u_particleDataProjection
  );

  float velocity = texture(u_vectorFieldV, textureCoord).r;

  if (lifetime > u_particleLifetime) {
    // "randomly" relocate particle to keep grid "full"
    float ry = texture(u_random, mod(id - u_randLonLatOffsets.yx, 1.0)).r;

    lonLat.y = (DIM.y / radians(DIM.y)) * asin(2.0 * ry - 1.0);
  } else {
    // move particle according to vectorField
    float multiplier = u_rate * (u_timeDelta / 1000.0) / M_PER_DEG;
    lonLat.y += multiplier * velocity;
  }

  // keep lonLat values in range
  lonLat.y = clamp(lonLat.y, -DIM_2.y, DIM_2.y);

  color = encode(lonLat.y, DIM.y, -DIM_2.y);
}
