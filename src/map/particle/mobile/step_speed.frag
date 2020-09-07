// Copied from ../step.frag, with parts not relating to speed step removed
precision highp float;

#pragma glslify: encode = require(./encode.glsl)
#pragma glslify: decode = require(./decode.glsl)
#pragma glslify: MAX_SPEED = require(./speed.glsl)

uniform sampler2D u_particleLongitudes;
uniform sampler2D u_particleLatitudes;
uniform sampler2D u_particleLifetimes;
uniform sampler2D u_vectorField;

uniform float u_gridWidth;
uniform float u_gridHeight;

uniform float u_particleLifetime;
uniform float u_timeDelta;

varying vec2 v_position;

const vec2 DIM = vec2(360.0, 180.0); // size of map in longitude and latitude
const vec2 DIM_2 = vec2(180.0, 90.0);

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
  float speed = length(velocity);

  if (lifetime > u_particleLifetime) {
    speed = 0.0;
  }

  gl_FragColor = encode(speed, MAX_SPEED, 0.0);
}
