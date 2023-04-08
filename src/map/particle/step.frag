#version 300 es
// Fragment shader for particle simulation

precision highp float;
precision highp int;
precision highp sampler2D;
precision highp isampler2D;

#pragma glslify: projectToTexture = require(../data-projections/)

uniform isampler2D u_particleData;
uniform sampler2D u_vectorFieldU;
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
out ivec4 color;

const vec2 DIM = vec2(360.0, 180.0); // size of map in longitude and latitude
const vec2 DIM_2 = vec2(180.0, 90.0);

const float M_PER_DEG = 111319.5;

void main() {
  vec2 id = (v_position + 1.0) / 2.0; // 2D "id" in between (0,0) and (1,1)
  vec4 data = intBitsToFloat(texture(u_particleData, id));
  vec2 lonLat = data.rg;
  float lifetime = data.b + u_timeDelta;

  vec2 textureCoord;
  projectToTexture(
      textureCoord,
      radians(lonLat),
      u_gridWidth,
      u_gridHeight,
      u_particleDataProjection
  );

  vec2 velocity;
  velocity.x = texture(u_vectorFieldU, textureCoord).r;
  velocity.y = texture(u_vectorFieldV, textureCoord).r;
  float speed = length(velocity);

  if (lifetime > u_particleLifetime) {
    // "randomly" relocate particle to keep grid "full"
    float rx = texture(u_random, mod(id + 10.0 * u_randLonLatOffsets, 1.0)).r;
    float ry = texture(u_random, mod(id - u_randLonLatOffsets.yx, 1.0)).r;

    lonLat.x = DIM.x * rx - DIM_2.x;
    lonLat.y = (DIM.y / radians(DIM.y)) * asin(2.0 * ry - 1.0);

    speed = 0.0;
    lifetime -= u_particleLifetime;
  } else {
    // move particle according to vectorField
    float multiplier = u_rate * (u_timeDelta / 1000.0) / M_PER_DEG;
    lonLat.x += multiplier * velocity.x / cos(radians(lonLat.y));
    lonLat.y += multiplier * velocity.y;
  }

  // keep lonLat values in range
  lonLat.x = mod(lonLat.x + DIM_2.x, DIM.x) - DIM_2.x;
  lonLat.y = clamp(lonLat.y, -DIM_2.y, DIM_2.y);

  color = floatBitsToInt(vec4(lonLat, lifetime, speed));
}
