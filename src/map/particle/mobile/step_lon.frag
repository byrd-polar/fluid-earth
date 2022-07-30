// Copied from ../step.frag, with parts not relating to longitude step removed
precision highp float;

#pragma glslify: encode = require(./encode.glsl)
#pragma glslify: decode = require(./decode.glsl)

#pragma glslify: projectToTexture = require(../../data-projections/)

uniform sampler2D u_particleLongitudes;
uniform sampler2D u_particleLatitudes;
uniform sampler2D u_particleLifetimes;
uniform sampler2D u_vectorFieldU;
uniform sampler2D u_random;

uniform vec2 u_randLonLatOffsets;

uniform float u_gridWidth;
uniform float u_gridHeight;
uniform int u_particleDataProjection;

uniform float u_particleLifetime;
uniform float u_timeDelta;
uniform float u_rate;

varying vec2 v_position;

const vec2 DIM = vec2(360.0, 180.0); // size of map in longitude and latitude
const vec2 DIM_2 = vec2(180.0, 90.0);

const float M_PER_DEG = 111319.5;

void main() {
  vec2 id = (v_position + 1.0) / 2.0; // 2D "id" in between (0,0) and (1,1)
  vec2 lonLat = vec2(
    decode(texture2D(u_particleLongitudes, id), DIM.x, -DIM_2.x),
    decode(texture2D(u_particleLatitudes, id), DIM.y, -DIM_2.y)
  );
  float lifetime = decode(texture2D(u_particleLifetimes, id),
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

  float velocity = texture2D(u_vectorFieldU, textureCoord).r;

  if (lifetime > u_particleLifetime) {
    // "randomly" relocate particle to keep grid "full"
    float rx = texture2D(u_random, mod(id + 10.0 * u_randLonLatOffsets, 1.0)).r;
    float ry = texture2D(u_random, mod(id - u_randLonLatOffsets.yx, 1.0)).r;

    lonLat.x = DIM.x * rx - DIM_2.x;
  } else {
    // move particle according to vectorField
    float multiplier = u_rate * (u_timeDelta / 1000.0) / M_PER_DEG;
    lonLat.x += multiplier * velocity / cos(radians(lonLat.y));
  }

  // keep lonLat values in range
  lonLat.x = mod(lonLat.x + DIM_2.x, DIM.x) - DIM_2.x;

  gl_FragColor = encode(lonLat.x, DIM.x, -DIM_2.x);
}
