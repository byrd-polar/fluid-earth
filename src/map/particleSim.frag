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
  vec2 texCoord = mod(lonLat, DIM) / DIM;

  vec2 velocity = texture2D(u_vectorField, texCoord).ra;

  lonLat += velocity;
  lonLat = mod(lonLat + DIM_2, DIM) - DIM_2;

  gl_FragColor = vec4(lonLat, 1, 1);
}
