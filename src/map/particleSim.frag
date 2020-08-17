// Fragment shader for particle simulation

precision mediump float;

uniform sampler2D u_coordinates;
uniform sampler2D u_vectorField;

varying vec2 v_position;

const vec2 DIM = vec2(360.0, 180.0); // size of map in longitude and latitude
const vec2 DIM_2 = vec2(180.0, 90.0);

void main() {
  vec2 lonLat = texture2D(u_coordinates, (v_position + 1.0) / 2.0).rg;

  // 90N 0E corresponds top-left corner
  // y-axis is flipped because textures start at bottom, not top
  vec2 texCoord;
  texCoord.x = mod(lonLat.x, DIM.x) / DIM.x;
  texCoord.y = (-lonLat.y + DIM_2.y) / DIM.y; // y-axis flip!!!

  vec2 velocity = texture2D(u_vectorField, texCoord).rg;

  // move particle according to vectorField
  lonLat.x += 0.01 * velocity.x / cos(radians(lonLat.y));
  lonLat.y += 0.01 * velocity.y;

  // keep lonLat values in range
  lonLat.x = mod(lonLat.x + DIM_2.x, DIM.x) - DIM_2.x;
  lonLat.y = clamp(lonLat.y, -90.0, 90.0);

  gl_FragColor = vec4(lonLat, 1, 1);
}
