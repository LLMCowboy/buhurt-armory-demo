/**
 * GLSL Chunks Library
 *
 * Modular GLSL functions importable as string constants.
 * Compose shaders by concatenating the chunks you need before your main() block.
 *
 * Usage:
 *   import { NOISE_2D, FBM, COLOR } from '@/lib/glsl/chunks'
 *   const frag = `${NOISE_2D}\n${FBM}\nvoid main() { ... }`
 */

// ─────────────────────────────────────────────────────────────────────────────
// HASH — pseudo-random functions (building block for all noise)
// ─────────────────────────────────────────────────────────────────────────────
export const HASH = /* glsl */ `
// Float → float
float hash1(float n) {
  return fract(sin(n) * 43758.5453123);
}

// Vec2 → float (most common — for 2D noise)
float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Vec2 → vec2 (for gradient noise)
vec2 hash22(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453123);
}

// Vec3 → float
float hash31(vec3 p) {
  return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453123);
}

// Vec3 → vec3 (for 3D gradient noise)
vec3 hash33(vec3 p) {
  p = vec3(
    dot(p, vec3(127.1, 311.7, 74.7)),
    dot(p, vec3(269.5, 183.3, 246.1)),
    dot(p, vec3(113.5, 271.9, 124.6))
  );
  return fract(sin(p) * 43758.5453123);
}
`

// ─────────────────────────────────────────────────────────────────────────────
// VALUE NOISE — smooth noise via bilinear interpolation of hash values
// ─────────────────────────────────────────────────────────────────────────────
export const NOISE_VALUE = /* glsl */ `
${HASH}

// 2D value noise [0, 1]
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  // Quintic smoothstep — smoother than cubic (Ken Perlin's improvement)
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);

  float a = hash21(i + vec2(0.0, 0.0));
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));

  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// 3D value noise [0, 1]
float vnoise3(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  vec3 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);

  float a = hash31(i + vec3(0,0,0));
  float b = hash31(i + vec3(1,0,0));
  float c = hash31(i + vec3(0,1,0));
  float d = hash31(i + vec3(1,1,0));
  float e = hash31(i + vec3(0,0,1));
  float f_ = hash31(i + vec3(1,0,1));
  float g = hash31(i + vec3(0,1,1));
  float h = hash31(i + vec3(1,1,1));

  return mix(mix(mix(a,b,u.x), mix(c,d,u.x), u.y),
             mix(mix(e,f_,u.x), mix(g,h,u.x), u.y), u.z);
}
`

// ─────────────────────────────────────────────────────────────────────────────
// SIMPLEX NOISE — faster, fewer artifacts than Perlin (Stefan Gustavson)
// ─────────────────────────────────────────────────────────────────────────────
export const NOISE_SIMPLEX = /* glsl */ `
vec3 _permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

// 2D Simplex noise, returns [-1, 1]
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = _permute(_permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m * m * m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x  * x0.x   + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// 3D Simplex noise, returns [-1, 1]
float snoise3(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod(i, 289.0);
  vec4 p = _permute(_permute(_permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 1.0 / 7.0;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = 1.79284291400159 - 0.85373472095314 * vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`

// ─────────────────────────────────────────────────────────────────────────────
// FBM — fractal Brownian motion (layered octaves of noise)
// The core technique for organic, cloud-like forms
// ─────────────────────────────────────────────────────────────────────────────
export const FBM = /* glsl */ `
${NOISE_VALUE}

// FBM with 6 octaves
// persistence: how much each octave contributes (0.5 = each half the previous)
// lacunarity: how much frequency increases each octave (2.0 = doubles)
// The rotation matrix reduces axis-aligned grid artifacts
float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  mat2 rot = mat2(1.6, 1.2, -1.2, 1.6); // rotate 36deg + scale 2x

  for (int i = 0; i < 6; i++) {
    value += amplitude * vnoise(p * frequency);
    amplitude *= 0.5;
    frequency *= 2.0;
    p = rot * p;
  }
  return value;
}

// FBM with configurable octave count
float fbmN(vec2 p, int octaves, float persistence, float lacunarity) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for (int i = 0; i < 8; i++) {
    if (i >= octaves) break;
    value += amplitude * vnoise(p * frequency);
    amplitude *= persistence;
    frequency *= lacunarity;
  }
  return value;
}
`

// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN WARPING — fbm(fbm(x)) creates highly organic, fluid forms
// Technique by Inigo Quilez. The most powerful noise pattern.
// ─────────────────────────────────────────────────────────────────────────────
export const DOMAIN_WARP = /* glsl */ `
${FBM}

// Single-level domain warp — moderate distortion
float warpFbm(vec2 p) {
  vec2 q = vec2(
    fbm(p + vec2(0.0, 0.0)),
    fbm(p + vec2(5.2, 1.3))
  );
  return fbm(p + 4.0 * q);
}

// Two-level domain warp — extreme organic distortion (Quilez's "f(f(f(x)))")
float warpFbm2(vec2 p) {
  vec2 q = vec2(
    fbm(p + vec2(0.0, 0.0)),
    fbm(p + vec2(5.2, 1.3))
  );
  vec2 r = vec2(
    fbm(p + 4.0 * q + vec2(1.7, 9.2)),
    fbm(p + 4.0 * q + vec2(8.3, 2.8))
  );
  return fbm(p + 4.0 * r);
}
`

// ─────────────────────────────────────────────────────────────────────────────
// CURL NOISE — divergence-free noise field for fluid-like particle motion
// Ensures no particle sources or sinks — they flow like real fluid
// ─────────────────────────────────────────────────────────────────────────────
export const CURL_NOISE = /* glsl */ `
${NOISE_SIMPLEX}

// Compute curl of the 3D simplex noise gradient
// Returns a velocity vector — plug directly into particle position update
vec3 curlNoise(vec3 p) {
  const float e = 0.1;

  // Sample noise gradient via finite differences
  float nx0 = snoise3(p + vec3(e, 0, 0));
  float nx1 = snoise3(p - vec3(e, 0, 0));
  float ny0 = snoise3(p + vec3(0, e, 0));
  float ny1 = snoise3(p - vec3(0, e, 0));
  float nz0 = snoise3(p + vec3(0, 0, e));
  float nz1 = snoise3(p - vec3(0, 0, e));

  // Curl = ∇ × F  (cross product of gradient)
  float x = (ny0 - ny1) - (nz0 - nz1);
  float y = (nz0 - nz1) - (nx0 - nx1);
  float z = (nx0 - nx1) - (ny0 - ny1);

  return normalize(vec3(x, y, z));
}

// 2D curl — useful for 2D fluid effects
vec2 curlNoise2(vec2 p) {
  const float e = 0.1;
  float n0 = snoise(p + vec2(0, e));
  float n1 = snoise(p - vec2(0, e));
  float n2 = snoise(p + vec2(e, 0));
  float n3 = snoise(p - vec2(e, 0));
  return vec2((n0 - n1) / (2.0 * e), -(n2 - n3) / (2.0 * e));
}
`

// ─────────────────────────────────────────────────────────────────────────────
// SDF — Signed Distance Functions (Inigo Quilez)
// A SDF returns: negative inside, 0 on surface, positive outside
// This enables raymarching — step along a ray by the SDF value until < epsilon
// ─────────────────────────────────────────────────────────────────────────────
export const SDF = /* glsl */ `
// Primitives
float sdSphere(vec3 p, float r) {
  return length(p) - r;
}

float sdBox(vec3 p, vec3 b) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float sdTorus(vec3 p, vec2 t) {
  // t.x = major radius, t.y = minor radius
  vec2 q = vec2(length(p.xz) - t.x, p.y);
  return length(q) - t.y;
}

float sdCapsule(vec3 p, vec3 a, vec3 b, float r) {
  vec3 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h) - r;
}

float sdCylinder(vec3 p, vec3 c) {
  // c.xy = endpoint offsets, c.z = radius
  return length(p.xz - c.xy) - c.z;
}

float sdPlane(vec3 p, vec3 n, float h) {
  return dot(p, normalize(n)) + h;
}

float sdOctahedron(vec3 p, float s) {
  p = abs(p);
  return (p.x + p.y + p.z - s) * 0.57735027;
}

// Boolean operations
float opUnion(float d1, float d2) { return min(d1, d2); }
float opSubtract(float d1, float d2) { return max(-d1, d2); }
float opIntersect(float d1, float d2) { return max(d1, d2); }

// Smooth boolean operations — k controls blend radius
float opSmoothUnion(float d1, float d2, float k) {
  float h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0);
  return mix(d2, d1, h) - k * h * (1.0 - h);
}
float opSmoothSubtract(float d1, float d2, float k) {
  float h = clamp(0.5 - 0.5 * (d2 + d1) / k, 0.0, 1.0);
  return mix(d2, -d1, h) + k * h * (1.0 - h);
}
float opSmoothIntersect(float d1, float d2, float k) {
  float h = clamp(0.5 - 0.5 * (d2 - d1) / k, 0.0, 1.0);
  return mix(d2, d1, h) + k * h * (1.0 - h);
}

// Domain operations
vec3 opRepeat(vec3 p, vec3 c) { return mod(p + 0.5 * c, c) - 0.5 * c; }
vec3 opTwist(vec3 p, float k) {
  float c = cos(k * p.y), s = sin(k * p.y);
  mat2 m = mat2(c, -s, s, c);
  return vec3(m * p.xz, p.y);
}
`

// ─────────────────────────────────────────────────────────────────────────────
// RAYMARCHING — sphere tracing algorithm for rendering SDF scenes
// Define map(vec3 p) → float in your shader before using these
// ─────────────────────────────────────────────────────────────────────────────
export const RAYMARCH = /* glsl */ `
// Estimate surface normal via central differences
// map() must be defined before calling this
vec3 calcNormal(vec3 p) {
  const vec2 e = vec2(0.001, 0.0);
  return normalize(vec3(
    map(p + e.xyy) - map(p - e.xyy),
    map(p + e.yxy) - map(p - e.yxy),
    map(p + e.yyx) - map(p - e.yyx)
  ));
}

// Ambient occlusion — cheap, 5 samples along normal
float calcAO(vec3 p, vec3 n) {
  float occ = 0.0;
  float sca = 1.0;
  for (int i = 0; i < 5; i++) {
    float h = 0.01 + 0.12 * float(i) / 4.0;
    float d = map(p + h * n);
    occ += (h - d) * sca;
    sca *= 0.95;
  }
  return clamp(1.0 - 3.0 * occ, 0.0, 1.0);
}

// Soft shadow — cast a ray from p toward light direction l
float calcSoftshadow(vec3 p, vec3 l, float mint, float maxt, float k) {
  float res = 1.0;
  float t = mint;
  for (int i = 0; i < 64; i++) {
    float h = map(p + l * t);
    if (h < 0.001) return 0.0;
    res = min(res, k * h / t);
    t += clamp(h, 0.01, 0.2);
    if (t > maxt) break;
  }
  return clamp(res, 0.0, 1.0);
}

// Main ray march — returns hit distance or -1.0 for miss
// MAX_STEPS and SURF_DIST can be overridden before including this chunk
#ifndef MAX_STEPS
  #define MAX_STEPS 96
#endif
#ifndef SURF_DIST
  #define SURF_DIST 0.001
#endif

float raymarch(vec3 ro, vec3 rd) {
  float t = 0.0;
  for (int i = 0; i < MAX_STEPS; i++) {
    vec3 p = ro + t * rd;
    float d = map(p);
    if (d < SURF_DIST) return t;
    if (t > 100.0) break;
    t += d;
  }
  return -1.0;
}

// Camera ray from UV and camera parameters
vec3 getCameraRay(vec2 uv, vec3 ro, vec3 target, float fov) {
  vec3 forward = normalize(target - ro);
  vec3 right = normalize(cross(vec3(0, 1, 0), forward));
  vec3 up = cross(forward, right);
  float tanHalfFov = tan(radians(fov) * 0.5);
  return normalize(forward + uv.x * right * tanHalfFov + uv.y * up * tanHalfFov);
}
`

// ─────────────────────────────────────────────────────────────────────────────
// COLOR — palette, tone mapping, space conversion
// ─────────────────────────────────────────────────────────────────────────────
export const COLOR = /* glsl */ `
// HSV → RGB  (h: 0-1, s: 0-1, v: 0-1)
vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

// RGB → HSV
vec3 rgb2hsv(vec3 c) {
  vec4 K = vec4(0.0, -1.0/3.0, 2.0/3.0, -1.0);
  vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
  float d = q.x - min(q.w, q.y);
  float e = 1.0e-10;
  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

// Inigo Quilez cosine palette — the most versatile color function in GLSL
// t: 0-1 input, a: offset, b: amplitude, c: frequency, d: phase
// Presets: https://iquilezles.org/articles/palettes/
vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(6.28318 * (c * t + d));
}

// Ready-made palette presets
vec3 paletteCool(float t) {
  return palette(t, vec3(0.5), vec3(0.5), vec3(1.0), vec3(0.0, 0.1, 0.2));
}
vec3 paletteFire(float t) {
  return palette(t, vec3(0.5, 0.3, 0.2), vec3(0.5, 0.4, 0.3), vec3(1.0), vec3(0.0, 0.15, 0.2));
}
vec3 paletteNeon(float t) {
  return palette(t, vec3(0.5), vec3(0.5), vec3(2.0, 1.0, 0.0), vec3(0.5, 0.2, 0.25));
}
vec3 palettePurple(float t) {
  return palette(t, vec3(0.4, 0.2, 0.5), vec3(0.4, 0.3, 0.4), vec3(1.0, 1.0, 0.5), vec3(0.0, 0.15, 0.5));
}

// Tone mapping
vec3 tonemapACES(vec3 x) {
  // ACES filmic approximation (Narkowicz 2015)
  const float a = 2.51, b = 0.03, c = 2.43, d = 0.59, e = 0.14;
  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}
vec3 tonemapReinhard(vec3 x) { return x / (1.0 + x); }
vec3 tonemapFilmic(vec3 x) {
  x = max(vec3(0.0), x - 0.004);
  return (x * (6.2 * x + 0.5)) / (x * (6.2 * x + 1.7) + 0.06);
}

// Gamma correction
vec3 gamma(vec3 c, float g) { return pow(max(c, 0.0), vec3(1.0 / g)); }
vec3 linearToSRGB(vec3 c) { return gamma(c, 2.2); }
vec3 sRGBToLinear(vec3 c) { return pow(max(c, 0.0), vec3(2.2)); }
`

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY — common helpers
// ─────────────────────────────────────────────────────────────────────────────
export const UTIL = /* glsl */ `
// Remap value from [a,b] to [c,d]
float remap(float v, float a, float b, float c, float d) {
  return c + (d - c) * clamp((v - a) / (b - a), 0.0, 1.0);
}

// Smooth minimum (for blending distances or values)
float smin(float a, float b, float k) {
  float h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - h * h * k * 0.25;
}

// Rotation matrices
mat2 rot2(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
mat3 rotX(float a) { float c = cos(a), s = sin(a); return mat3(1,0,0, 0,c,-s, 0,s,c); }
mat3 rotY(float a) { float c = cos(a), s = sin(a); return mat3(c,0,s, 0,1,0, -s,0,c); }
mat3 rotZ(float a) { float c = cos(a), s = sin(a); return mat3(c,-s,0, s,c,0, 0,0,1); }

// Vignette — darken edges (uv centered at 0.5,0.5)
float vignette(vec2 uv, float strength, float smoothness) {
  uv = uv * 2.0 - 1.0;
  return 1.0 - smoothstep(1.0 - smoothness, 1.0, length(uv) * strength);
}

// Film grain — animated noise
float grain(vec2 uv, float time, float strength) {
  return (fract(sin(dot(uv + fract(time * 0.01), vec2(127.1, 311.7))) * 43758.5453) - 0.5) * strength;
}

// Fresnel — bright edges, useful for glow effects
float fresnel(vec3 viewDir, vec3 normal, float power) {
  return pow(1.0 - abs(dot(viewDir, normal)), power);
}
`
