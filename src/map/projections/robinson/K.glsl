#pragma glslify: export(K)

const float C = 1.593415793900743;

vec2 K(int i) {
  if (i ==  0) return vec2(0.9986, -0.062 * C);
  if (i ==  1) return vec2(1.0000, 0.0000 * C);
  if (i ==  2) return vec2(0.9986, 0.0620 * C);
  if (i ==  3) return vec2(0.9954, 0.1240 * C);
  if (i ==  4) return vec2(0.9900, 0.1860 * C);
  if (i ==  5) return vec2(0.9822, 0.2480 * C);
  if (i ==  6) return vec2(0.9730, 0.3100 * C);
  if (i ==  7) return vec2(0.9600, 0.3720 * C);
  if (i ==  8) return vec2(0.9427, 0.4340 * C);
  if (i ==  9) return vec2(0.9216, 0.4958 * C);
  if (i == 10) return vec2(0.8962, 0.5571 * C);
  if (i == 11) return vec2(0.8679, 0.6176 * C);
  if (i == 12) return vec2(0.8350, 0.6769 * C);
  if (i == 13) return vec2(0.7986, 0.7346 * C);
  if (i == 14) return vec2(0.7597, 0.7903 * C);
  if (i == 15) return vec2(0.7186, 0.8435 * C);
  if (i == 16) return vec2(0.6732, 0.8936 * C);
  if (i == 17) return vec2(0.6213, 0.9394 * C);
  if (i == 18) return vec2(0.5722, 0.9761 * C);
  if (i == 19) return vec2(0.5322, 1.0000 * C);
  if (i == 20) return vec2(0.5322, 1.0000 * C);
}
