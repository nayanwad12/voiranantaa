/**
 * The particle sculptures. Every form is a GLSL function that maps a particle's random seed
 * (s ∈ [0,1)³ plus r ∈ [0,1)) to a position and a "tone" (0–1, picks its colour from the palette).
 * Because every particle exists in every shape, any two shapes morph into each other on the GPU.
 * All procedural — no models, no textures.
 */
export const SHAPE_NAMES = [
  'bindu', // the first note: a single point of light
  'infinity', // ∞ — the raga with no end
  'gown', // wearable art
  'lotus', // SHRINGARA — beauty / love
  'bubbles', // HASYA — joy
  'rain', // KARUNA — compassion / sorrow
  'burst', // RAUDRA — intensity / anger
  'flame', // VEERA — courage
  'shiver', // BHAYANAKA — fear
  'knot', // BIBHATSA — disquiet
  'galaxy', // ADBHUTA — wonder
  'water', // SHANTA — peace
  'form', // RAGA / FORM — sculptural geometry
  'voice', // RAGA / VOICE — sound waves
  'dust', // 04 — matter, scattered
  'line', // 05 — a single hand-drawn line
  'stageGown', // 06 — the gown on the plinth
  'river', // 07 — every discipline, one flow
  'constellation', // 08 — 20 finalists, 2 winners
  'astrolabe', // 09 — six lenses
  'helix', // 10 — the journey
  'arc', // 13 — footlights on a stage
  'weave', // 15 — build the infinite with us
] as const

export type ShapeName = (typeof SHAPE_NAMES)[number]
export const SHAPE_INDEX = Object.fromEntries(SHAPE_NAMES.map((n, i) => [n, i])) as Record<ShapeName, number>

/** Rasa key (content/site.ts) → its world. */
export const RASA_SHAPE: Record<string, ShapeName> = {
  shringara: 'lotus',
  hasya: 'bubbles',
  karuna: 'rain',
  raudra: 'burst',
  veera: 'flame',
  bhayanaka: 'shiver',
  bibhatsa: 'knot',
  adbhuta: 'galaxy',
  shanta: 'water',
}

/** Where the timeline helix runs (the beads sit on it). */
export const helixX = (wide: boolean) => (wide ? 3.3 : 1.15)

export const SHAPES_GLSL = /* glsl */ `
#define PI 3.14159265
#define TAU 6.28318531
uniform float uFit;
uniform float uWide;
uniform float uWinners;

float hash11(float n) { return fract(sin(n * 127.1) * 43758.5453); }
vec3 sphereDir(vec2 u) { float z = u.x * 2.0 - 1.0; float a = u.y * TAU; float r = sqrt(max(0.0, 1.0 - z * z)); return vec3(r * cos(a), z, r * sin(a)); }
mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
float tri(float x) { return abs(fract(x) - 0.5) * 4.0 - 1.0; }

vec4 sBindu(vec3 s, float r, float t) {
  float rad = (0.035 + pow(s.z, 5.0) * 1.1) * (1.0 + 0.2 * sin(t * 2.4 - s.z * 4.0));
  return vec4(sphereDir(s.xy) * rad, s.z);
}

vec4 sInfinity(vec3 s, float r, float t) {
  float u = fract(s.x + t * 0.035);
  float th = u * TAU;
  float sn = sin(th), cs = cos(th);
  float den = 1.0 + sn * sn;
  float a = 2.6 * uFit;
  vec3 c = vec3(a * cs / den, a * sn * cs / den, 0.0);
  float tw = th * 0.5 + t * 0.25; // a slow Möbius twist along the ribbon
  float w = (s.y - 0.5) * 0.5 * (0.55 + 0.45 * sin(th * 3.0 + t));
  float h = (s.z - 0.5) * 0.05;
  vec3 p = c + vec3(0.0, cos(tw), sin(tw)) * w + vec3(0.0, -sin(tw), cos(tw)) * h;
  p += (r > 0.94) ? sphereDir(s.yz) * (r - 0.94) * 9.0 : vec3(0.0); // a few sparks drifting off
  p.xz = rot(0.3 * sin(t * 0.2)) * p.xz;
  return vec4(p, u);
}

vec4 sGown(vec3 s, float r, float t) {
  float h = s.x; // 0 = hem, 1 = neckline
  float y = mix(-2.25, 1.85, h);
  float rad;
  if (h < 0.6) { float k = (0.6 - h) / 0.6; rad = 0.34 + 1.55 * pow(k, 1.35); }
  else if (h < 0.84) { rad = mix(0.34, 0.52, smoothstep(0.6, 0.84, h)); }
  else { rad = mix(0.52, 0.15, smoothstep(0.84, 1.0, h)); }
  float th = s.y * TAU + h * 2.2 + t * 0.3;
  rad *= 1.0 + 0.08 * sin(th * 11.0 + h * 18.0 - t * 1.6) * (1.0 - h); // ruffles
  if (s.z > 0.9) rad *= fract(s.z * 13.0); // a little inner volume
  vec3 p = vec3(cos(th) * rad, y, sin(th) * rad);
  if (h < 0.06) { p.xz *= 1.0 + (0.06 - h) * 22.0 * r; p.y -= (0.06 - h) * 3.0 * r; } // the hem dissolves into dust
  return vec4(p, h);
}

vec4 sLotus(vec3 s, float r, float t) {
  float layer = floor(s.x * 3.0);
  float n = 6.0 + layer * 3.0;
  float th = s.y * TAU + layer * 0.4 + t * 0.08;
  float petal = pow(abs(cos(th * n * 0.5)), 0.7);
  float R = (2.0 - layer * 0.5) * petal * sqrt(s.z);
  float open = 0.85 + 0.15 * sin(t * 0.6);
  vec3 p = vec3(cos(th) * R, 0.3 * R * R * open + layer * 0.2 - 0.7, sin(th) * R);
  if (r > 0.93) p = vec3(0.0, -0.4, 0.0) + sphereDir(s.yz) * 0.25 * r; // the glowing heart
  p.yz = rot(-0.38) * p.yz;
  return vec4(p, clamp(s.z * 0.75 + layer * 0.12, 0.0, 1.0));
}

vec4 sBubbles(vec3 s, float r, float t) {
  float b = floor(s.x * 44.0);
  float h1 = hash11(b + 1.3), h2 = hash11(b + 7.1), h3 = hash11(b + 3.7);
  vec3 c = vec3((h1 - 0.5) * 8.5 * uFit, -1.9 + 3.6 * abs(sin(t * (1.1 + h2) + h3 * TAU)), (h2 - 0.5) * 4.0 - 0.8);
  float rad = 0.12 + 0.32 * h3;
  return vec4(c + sphereDir(s.yz) * rad, h1);
}

vec4 sRain(vec3 s, float r, float t) {
  // Heavy, slow streams of falling light that pool into ripples at the bottom.
  float col = floor(s.x * 64.0);
  float h = hash11(col + 2.7);
  float fall = fract(s.z * 0.35 + t * (0.12 + 0.08 * h) + h * 3.0);
  vec3 p = vec3((col / 64.0 - 0.5) * 7.5 * uFit + (s.y - 0.5) * 0.05, 3.3 - fall * fall * 6.4, (h - 0.5) * 4.0 - 0.8);
  if (r > 0.82) { // the pool: rings spreading where the drops land
    float ring = fract(t * 0.25 + h);
    float a = s.y * TAU;
    p = vec3((col / 64.0 - 0.5) * 7.5 * uFit, -3.1, (h - 0.5) * 4.0 - 0.8) + vec3(cos(a), 0.0, sin(a)) * ring * 0.9;
  }
  return vec4(p, fall);
}

vec4 sBurst(vec3 s, float r, float t) {
  // Shards flung outward along jagged rays, the whole star spinning.
  float ray = floor(s.x * 46.0);
  vec3 dir = sphereDir(vec2(hash11(ray + 0.7), hash11(ray + 9.1)));
  float len = (0.6 + 2.6 * hash11(ray + 4.3)) * (0.85 + 0.15 * sin(t * 3.0 + ray));
  float along = pow(s.y, 0.7) * len;
  vec3 side = normalize(cross(dir, vec3(0.3, 1.0, 0.2)));
  float jag = tri(along * 2.2 + t * 1.8 + ray) * 0.12 * along;
  vec3 p = dir * along + side * jag + sphereDir(vec2(s.z, r)) * 0.04 * (1.0 + along);
  if (r > 0.86) p = sphereDir(s.yz) * 0.45 * pow(s.x, 0.4); // the white-hot core
  p.xz = rot(t * 0.6) * p.xz;
  p.xy = rot(t * 0.35) * p.xy;
  return vec4(p, 1.0 - clamp(along / 3.0, 0.0, 1.0));
}

vec4 sFlame(vec3 s, float r, float t) {
  float h = fract(s.x + t * 0.2);
  float rad = 0.95 * pow(1.0 - h, 0.9) * sqrt(s.y) + 0.04;
  float th = s.z * TAU + h * 7.0 + t * 2.2;
  vec3 p = vec3(cos(th) * rad, -2.5 + h * 5.4, sin(th) * rad);
  p.x += 0.18 * sin(h * 6.0 + t * 1.3);
  return vec4(p, h);
}

vec4 sShiver(vec3 s, float r, float t) {
  vec3 d = sphereDir(s.xy);
  float rad = 1.45 + 0.06 * sin(dot(d, vec3(31.0, 17.0, 23.0)) + t * 38.0) + 0.04 * sin(t * 53.0 + s.z * 40.0);
  if (s.z > 0.965) rad += 2.4 * fract(t * 2.7 + s.x * 5.0); // lightning
  return vec4(d * rad, s.z);
}

vec4 sKnot(vec3 s, float r, float t) {
  float ph = s.x * TAU + 0.12 * sin(t * 0.8 + s.x * 20.0);
  float R = 1.25 + 0.5 * cos(7.0 * ph);
  vec3 c = vec3(R * cos(3.0 * ph), R * sin(3.0 * ph), 0.55 * sin(7.0 * ph));
  vec3 p = c + sphereDir(s.yz) * 0.16 * (0.6 + 0.4 * sin(t * 2.0 + s.x * 30.0));
  p.xz = rot(t * 0.15) * p.xz;
  return vec4(p, s.x);
}

vec4 sGalaxy(vec3 s, float r, float t) {
  float arm = floor(s.x * 3.0);
  float rr = pow(s.y, 0.55) * 3.6 * (1.0 + 0.12 * sin(t * 0.9));
  float th = arm * TAU / 3.0 + rr * 1.5 + t * 0.3 + (s.z - 0.5) * 0.9 / (rr + 0.35);
  vec3 p = vec3(cos(th) * rr, (s.z - 0.5) * 0.35 / (rr + 0.6), sin(th) * rr);
  p.yz = rot(0.55) * p.yz;
  return vec4(p, 1.0 - s.y);
}

vec4 sWater(vec3 s, float r, float t) {
  vec3 p = vec3((s.x - 0.5) * 13.0 * uFit, 0.0, (s.y - 0.5) * 9.0 - 2.5);
  p.y = -1.3 + 0.06 * sin(p.x * 1.4 + t * 0.5) * cos(p.z * 1.2 + t * 0.35);
  return vec4(p, s.y);
}

vec4 sForm(vec3 s, float r, float t) {
  float u = s.x * TAU, v = s.y * TAU;
  float R = 1.05, rr = 0.42 * (1.0 + 0.25 * cos(3.0 * u + t));
  vec2 cs = vec2(cos(v + u * 2.0 + t * 0.4), sin(v + u * 2.0 + t * 0.4));
  cs = sign(cs) * pow(abs(cs), vec2(0.35)); // a squarish, sculpted cross-section
  vec3 p = vec3((R + rr * cs.x) * cos(u), rr * cs.y, (R + rr * cs.x) * sin(u));
  p.yz = rot(1.1 + 0.2 * sin(t * 0.3)) * p.yz;
  p.xz = rot(t * 0.35) * p.xz;
  float wide = step(0.5, uWide);
  p *= mix(0.62, 1.0, wide);
  p += mix(vec3(0.0, 0.7, 0.0), vec3(-2.7, 0.0, 0.0), wide);
  return vec4(p, s.y);
}

vec4 sVoice(vec3 s, float r, float t) {
  float k = floor(s.x * 7.0);
  float th = s.y * TAU;
  float R = 0.35 + k * 0.24 + 0.13 * sin(th * (5.0 + k * 2.0) + t * (3.0 + k * 0.4) - k) * sin(t * 1.7 + k);
  vec3 p = vec3(cos(th) * R, sin(th) * R, (s.z - 0.5) * 0.05);
  float wide = step(0.5, uWide);
  p *= mix(0.65, 1.0, wide);
  p += mix(vec3(0.0, -0.6, 0.0), vec3(2.7, 0.0, 0.0), wide);
  return vec4(p, k / 7.0);
}

vec4 sDust(vec3 s, float r, float t) {
  vec3 p = (s - 0.5) * vec3(13.0 * uFit, 8.0, 7.0) + vec3(0.0, 0.0, -1.5);
  p += 0.25 * vec3(sin(t * 0.3 + s.y * 20.0), cos(t * 0.25 + s.z * 20.0), sin(t * 0.2 + s.x * 20.0));
  return vec4(p, s.z);
}

vec4 sLine(vec3 s, float r, float t) {
  vec3 p = vec3((s.x - 0.5) * 15.0 * max(uFit, 0.7), -0.4 + 0.22 * sin(s.x * 7.0 + t * 0.35), 0.0);
  p += (vec3(s.y, s.z, r) - 0.5) * vec3(0.02, 0.05, 0.05) * (1.0 + 5.0 * pow(r, 6.0));
  return vec4(p, s.x);
}

vec4 sStageGown(vec3 s, float r, float t) {
  vec4 g = sGown(s, r, t * 0.6);
  float wide = step(0.5, uWide);
  g.xyz *= mix(0.5, 0.74, wide);
  g.y += mix(-0.6, 0.35, wide);
  return g;
}

vec4 sRiver(vec3 s, float r, float t) {
  float u = fract(s.x + t * 0.025);
  float x = u * 18.0 - 9.0;
  vec3 p = vec3(x, -1.9 + 0.35 * sin(x * 0.45 + t * 0.8) + (s.y - 0.5) * 0.45 * (0.6 + 0.4 * sin(x + t)), (s.z - 0.5) * 2.4 - 1.0);
  return vec4(p, u);
}

vec4 sConstellation(vec3 s, float r, float t) {
  float c = floor(s.x * 20.0);
  float g = step(10.0, c);
  float k = c - g * 10.0;
  float col = mod(k, 5.0), row = floor(k / 5.0);
  vec3 center = uWide > 0.5
    ? vec3(mix(-3.8, 1.4, g) + col * 0.6, 0.35 - row * 0.65, 0.0)
    : vec3(-1.1 + col * 0.55, mix(1.2, -1.1, g) - row * 0.55, 0.0);
  float win = k < 0.5 ? 1.0 : 0.0; // the first star of each category
  vec3 p = center + sphereDir(s.yz) * (0.06 + 0.2 * win * uWinners) * pow(r, 2.0) * 1.6;
  if (r > 0.9) p = (vec3(s.y, s.z, fract(r * 9.0)) - 0.5) * vec3(14.0, 8.0, 6.0); // faint sky
  return vec4(p, win);
}

vec4 sAstrolabe(vec3 s, float r, float t) {
  float k = floor(s.x * 6.0);
  float th = s.y * TAU;
  float R = (uWide > 0.5 ? 2.5 : 1.35) * (0.82 + k * 0.04);
  vec3 p = vec3(cos(th) * R, sin(th) * R, 0.0) + (vec3(s.z, r, s.x) - 0.5) * 0.04;
  p.yz = rot(k * 0.52 + t * 0.12 * (mod(k, 2.0) * 2.0 - 1.0)) * p.yz;
  p.xz = rot(k * 1.05 + t * 0.1) * p.xz;
  p.z -= 1.5;
  return vec4(p, k / 6.0);
}

vec4 sHelix(vec3 s, float r, float t) {
  float strand = step(0.5, s.x);
  float h = s.y;
  float y = 7.5 - h * 15.0;
  float th = h * 16.0 + strand * PI + t * 0.35;
  float R = 0.55;
  vec3 a = vec3(cos(th) * R, y, sin(th) * R);
  vec3 p = a;
  if (s.z > 0.86) p = mix(a, vec3(cos(th + PI) * R, y, sin(th + PI) * R), fract(s.z * 37.0)); // rungs
  p += (vec3(r, s.z, s.x) - 0.5) * 0.04;
  p.x += uWide > 0.5 ? 3.3 : 1.15;
  p.z -= 0.5;
  return vec4(p, h);
}

vec4 sArc(vec3 s, float r, float t) {
  float c = floor(s.x * 20.0);
  float a = -1.0 + 2.0 * c / 19.0;
  vec3 center = uWide > 0.5 ? vec3(5.2 * sin(a), -2.1, 1.0 - 3.2 * cos(a)) : vec3(1.9 * sin(a), -2.1, 1.5 - 2.4 * cos(a));
  vec3 p = center + sphereDir(s.yz) * 0.09 * pow(r, 2.0) * 1.6;
  if (r > 0.8) p = center + vec3(0.0, s.z * 3.6, 0.0) + (vec3(s.y, r, s.z) - 0.5) * vec3(0.14, 0.0, 0.14) * (1.0 + s.z * 2.5); // beams
  return vec4(p, c / 20.0);
}

vec4 sWeave(vec3 s, float r, float t) {
  float warp = step(0.5, s.z);
  float i = floor(s.x * 26.0) / 26.0 - 0.5;
  float v = s.y - 0.5;
  vec3 p = warp > 0.5 ? vec3(i * 11.0 * uFit, v * 6.0, 0.0) : vec3(v * 11.0 * uFit, i * 6.0, 0.0);
  p.z += sin((warp > 0.5 ? p.y : p.x) * 9.0 + warp * PI) * 0.06; // over, under
  p.z += 0.45 * sin(p.x * 0.55 + t * 0.7) * cos(p.y * 0.6 + t * 0.5);
  p.yz = rot(-0.55) * p.yz;
  p.y -= 0.4;
  return vec4(p, warp * 0.5 + s.y * 0.5);
}

vec4 shape(int id, vec3 s, float r, float t) {
  if (id == 0) return sBindu(s, r, t);
  if (id == 1) return sInfinity(s, r, t);
  if (id == 2) return sGown(s, r, t);
  if (id == 3) return sLotus(s, r, t);
  if (id == 4) return sBubbles(s, r, t);
  if (id == 5) return sRain(s, r, t);
  if (id == 6) return sBurst(s, r, t);
  if (id == 7) return sFlame(s, r, t);
  if (id == 8) return sShiver(s, r, t);
  if (id == 9) return sKnot(s, r, t);
  if (id == 10) return sGalaxy(s, r, t);
  if (id == 11) return sWater(s, r, t);
  if (id == 12) return sForm(s, r, t);
  if (id == 13) return sVoice(s, r, t);
  if (id == 14) return sDust(s, r, t);
  if (id == 15) return sLine(s, r, t);
  if (id == 16) return sStageGown(s, r, t);
  if (id == 17) return sRiver(s, r, t);
  if (id == 18) return sConstellation(s, r, t);
  if (id == 19) return sAstrolabe(s, r, t);
  if (id == 20) return sHelix(s, r, t);
  if (id == 21) return sArc(s, r, t);
  return sWeave(s, r, t);
}
`
