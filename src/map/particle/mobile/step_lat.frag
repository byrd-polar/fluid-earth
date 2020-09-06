// Copied from ../step.frag, with parts not relating to longitude step removed
precision highp float;

#pragma glslify: encode = require(./encode.glsl)
#pragma glslify: decode = require(./decode.glsl)

uniform sampler2D u_particleLongitudes;
uniform sampler2D u_particleLatitudes;
uniform sampler2D u_particleLifetimes;
uniform sampler2D u_vectorField;
uniform sampler2D u_random;

uniform vec2 u_randLonLatOffsets;

uniform float u_gridWidth;
uniform float u_gridHeight;

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

  // 90N 0E corresponds top-left corner
  // y-axis is flipped because textures start at bottom, not top
  vec2 texCoord;
  texCoord.x = mod(lonLat.x, DIM.x) / DIM.x;
  texCoord.y = (-lonLat.y + DIM_2.y) / DIM.y; // y-axis flip!!!

  // offset/scale coords so it aligns accurately with given grid (grid points
  // were offset in the opposite direction earlier when texture was created)
  float xOffset = 0.5 / u_gridWidth;
  float yScale = (u_gridHeight - 1.0) / u_gridHeight;

  texCoord.x = mod(texCoord.x + xOffset, 1.0);
  texCoord.y = yScale * (texCoord.y - 0.5) + 0.5;

  vec2 velocity = texture2D(u_vectorField, texCoord).rg;

  if (lifetime > u_particleLifetime) {
    // "randomly" relocate particle to keep grid "full"
    float ry = texture2D(u_random, mod(id - u_randLonLatOffsets.yx, 1.0)).a;

    lonLat.y = (DIM.y / radians(DIM.y)) * asin(2.0 * ry - 1.0);
  } else {
    // move particle according to vectorField
    float multiplier = u_rate * (u_timeDelta / 1000.0) / M_PER_DEG;
    lonLat.y += multiplier * velocity.y;
  }

  // keep lonLat values in range
  lonLat.y = clamp(lonLat.y, -DIM_2.y, DIM_2.y);

  gl_FragColor = encode(lonLat.y, DIM.y, -DIM_2.y);
}
