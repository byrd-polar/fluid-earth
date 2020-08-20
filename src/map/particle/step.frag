// Fragment shader for particle simulation
precision mediump float;

uniform sampler2D u_particleData;
uniform sampler2D u_vectorField;
uniform sampler2D u_random;

uniform vec2 u_randLonLatOffsets;

uniform float u_particleCountSqrt;
uniform float u_particleLifetime;
uniform float u_timeDelta;
uniform float u_rate;

varying vec2 v_position;

const vec2 DIM = vec2(360.0, 180.0); // size of map in longitude and latitude
const vec2 DIM_2 = vec2(180.0, 90.0);

const float M_PER_DEG = 111319.5;

void main() {
  vec2 id = (v_position + 1.0) / 2.0; // 2D "id" in between (0,0) and (1,1)
  vec4 data = texture2D(u_particleData, id);
  vec2 lonLat = data.rg;
  float lifetime = data.b + u_timeDelta;

  // 90N 0E corresponds top-left corner
  // y-axis is flipped because textures start at bottom, not top
  vec2 texCoord;
  texCoord.x = mod(lonLat.x, DIM.x) / DIM.x;
  texCoord.y = (-lonLat.y + DIM_2.y) / DIM.y; // y-axis flip!!!

  vec2 velocity = texture2D(u_vectorField, texCoord).rg;

  if (lifetime > u_particleLifetime) {
    // "randomly" relocate particle to keep grid "full"
    float rx = texture2D(u_random, mod(id + 10.0 * u_randLonLatOffsets, 1.0)).a;
    float ry = texture2D(u_random, mod(id - u_randLonLatOffsets.yx, 1.0)).a;

    lonLat.x = DIM.x * rx - DIM_2.x;
    lonLat.y = (DIM.y / radians(DIM.y)) * asin(2.0 * ry - 1.0);

    lifetime -= u_particleLifetime;
  } else {
    // move particle according to vectorField
    float multiplier = u_rate * (u_timeDelta / 1000.0) / M_PER_DEG;
    lonLat.x += multiplier * velocity.x / cos(radians(lonLat.y));
    lonLat.y += multiplier * velocity.y;
  }

  // keep lonLat values in range
  lonLat.x = mod(lonLat.x + DIM_2.x, DIM.x) - DIM_2.x;
  lonLat.y = clamp(lonLat.y, -90.0, 90.0);

  // alpha value MUST be 1 for some reason, otherwise simulator doesn't proceed
  gl_FragColor = vec4(lonLat, lifetime, 1);
}
