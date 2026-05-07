/**
 * Post-Processing GLSL Chunks
 *
 * Each effect is a fragment shader that reads from a uTexture sampler
 * and outputs a modified color. Chain them via ping-pong FBOs.
 *
 * All shaders expect:
 *   uniform sampler2D uTexture;  — the previous pass's output
 *   varying vec2 vUv;            — screen UV from fullscreen quad
 */

// Full-screen quad vertex shader — shared by all post-processing passes
export const FULLSCREEN_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

// ─────────────────────────────────────────────────────────────────────────────
// BLOOM — threshold → blur → composite
// Two-pass: extract bright regions, then gaussian blur
// ─────────────────────────────────────────────────────────────────────────────

// Pass 1: Extract pixels above threshold
export const BLOOM_THRESHOLD_FRAG = /* glsl */ `
uniform sampler2D uTexture;
uniform float uThreshold;    // brightness cutoff — 0.7 is a good start
uniform float uKnee;         // smooth roll-off around threshold
varying vec2 vUv;

void main() {
  vec3 color = texture2D(uTexture, vUv).rgb;
  float brightness = dot(color, vec3(0.2126, 0.7152, 0.0722)); // luminance
  float soft = clamp(brightness - uThreshold + uKnee, 0.0, 2.0 * uKnee);
  soft = (soft * soft) / (4.0 * uKnee + 0.00001);
  float contribution = max(soft, brightness - uThreshold) / max(brightness, 0.00001);
  gl_FragColor = vec4(color * contribution, 1.0);
}
`

// Pass 2: Gaussian blur (separable — run twice: x then y)
export const GAUSSIAN_BLUR_FRAG = /* glsl */ `
uniform sampler2D uTexture;
uniform vec2 uDirection;     // (1,0) for horizontal, (0,1) for vertical
uniform vec2 uResolution;
varying vec2 vUv;

void main() {
  vec2 texel = 1.0 / uResolution;
  vec2 step = uDirection * texel;

  // 13-tap Gaussian weights
  vec4 color = vec4(0.0);
  color += texture2D(uTexture, vUv - step * 6.0) * 0.00598;
  color += texture2D(uTexture, vUv - step * 5.0) * 0.02045;
  color += texture2D(uTexture, vUv - step * 4.0) * 0.05405;
  color += texture2D(uTexture, vUv - step * 3.0) * 0.10801;
  color += texture2D(uTexture, vUv - step * 2.0) * 0.16254;
  color += texture2D(uTexture, vUv - step * 1.0) * 0.18358;
  color += texture2D(uTexture, vUv)               * 0.19077;
  color += texture2D(uTexture, vUv + step * 1.0) * 0.18358;
  color += texture2D(uTexture, vUv + step * 2.0) * 0.16254;
  color += texture2D(uTexture, vUv + step * 3.0) * 0.10801;
  color += texture2D(uTexture, vUv + step * 4.0) * 0.05405;
  color += texture2D(uTexture, vUv + step * 5.0) * 0.02045;
  color += texture2D(uTexture, vUv + step * 6.0) * 0.00598;
  gl_FragColor = color;
}
`

// Pass 3: Composite scene + bloom
export const BLOOM_COMPOSITE_FRAG = /* glsl */ `
uniform sampler2D uScene;
uniform sampler2D uBloom;
uniform float uIntensity;   // bloom strength — 0.5–1.5
varying vec2 vUv;

void main() {
  vec3 scene = texture2D(uScene, vUv).rgb;
  vec3 bloom = texture2D(uBloom, vUv).rgb;
  gl_FragColor = vec4(scene + bloom * uIntensity, 1.0);
}
`

// ─────────────────────────────────────────────────────────────────────────────
// CHROMATIC ABERRATION — RGB channel separation
// Simulates lens dispersion. Subtle = 0.002, dramatic = 0.01
// ─────────────────────────────────────────────────────────────────────────────
export const CHROMATIC_ABERRATION_FRAG = /* glsl */ `
uniform sampler2D uTexture;
uniform float uStrength;   // 0.0–0.02, centered around UV 0.5
uniform float uTime;       // optional — animate the aberration
varying vec2 vUv;

void main() {
  vec2 center = vUv - 0.5;
  float dist = length(center);

  // Radial offset — stronger at edges
  vec2 offset = normalize(center) * dist * uStrength;

  // Optional: add subtle time-based breathing
  offset *= 1.0 + 0.1 * sin(uTime * 0.5);

  float r = texture2D(uTexture, vUv + offset).r;
  float g = texture2D(uTexture, vUv).g;
  float b = texture2D(uTexture, vUv - offset).b;

  gl_FragColor = vec4(r, g, b, 1.0);
}
`

// ─────────────────────────────────────────────────────────────────────────────
// FILM GRAIN + VIGNETTE — most common finishing touches
// Apply last in chain
// ─────────────────────────────────────────────────────────────────────────────
export const GRAIN_VIGNETTE_FRAG = /* glsl */ `
uniform sampler2D uTexture;
uniform float uGrainStrength;    // 0.02–0.08
uniform float uVignetteStrength; // 0.3–0.8
uniform float uTime;
varying vec2 vUv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

void main() {
  vec3 color = texture2D(uTexture, vUv).rgb;

  // Animated grain — changes every frame via uTime
  float grain = (hash(vUv + fract(uTime * 0.01)) - 0.5) * uGrainStrength;
  color += grain;

  // Smooth vignette
  vec2 vig = vUv * 2.0 - 1.0;
  float vigMask = 1.0 - smoothstep(0.5, 1.4, length(vig) * uVignetteStrength);
  color *= vigMask;

  gl_FragColor = vec4(color, 1.0);
}
`

// ─────────────────────────────────────────────────────────────────────────────
// MOTION BLUR — accumulate previous frames (temporal)
// ─────────────────────────────────────────────────────────────────────────────
export const MOTION_BLUR_FRAG = /* glsl */ `
uniform sampler2D uCurrent;   // current frame
uniform sampler2D uPrevious;  // previous accumulated frame
uniform float uBlend;         // 0.1 = heavy blur, 0.9 = almost no blur
varying vec2 vUv;

void main() {
  vec4 current = texture2D(uCurrent, vUv);
  vec4 previous = texture2D(uPrevious, vUv);
  // Blend current frame with accumulated history
  gl_FragColor = mix(previous, current, uBlend);
}
`

// ─────────────────────────────────────────────────────────────────────────────
// DEPTH OF FIELD — simple radial blur based on distance from focal point
// ─────────────────────────────────────────────────────────────────────────────
export const DEPTH_OF_FIELD_FRAG = /* glsl */ `
uniform sampler2D uTexture;
uniform sampler2D uDepth;
uniform float uFocalDepth;   // 0–1 normalized depth of focus plane
uniform float uFocalRange;   // how wide the in-focus zone is
uniform float uBlurStrength;
varying vec2 vUv;

void main() {
  float depth = texture2D(uDepth, vUv).r;
  float blur = abs(depth - uFocalDepth) / uFocalRange;
  blur = clamp(blur, 0.0, 1.0) * uBlurStrength;

  // Radial blur from center toward edges based on blur amount
  vec4 color = vec4(0.0);
  float total = 0.0;
  int samples = 16;
  for (int i = 0; i < 16; i++) {
    float angle = float(i) / 16.0 * 6.28318;
    vec2 offset = vec2(cos(angle), sin(angle)) * blur * 0.01;
    color += texture2D(uTexture, vUv + offset);
    total += 1.0;
  }
  gl_FragColor = color / total;
}
`

// ─────────────────────────────────────────────────────────────────────────────
// TONE MAPPING — final color grading pass
// Apply after all effects, before output
// ─────────────────────────────────────────────────────────────────────────────
export const TONEMAP_FRAG = /* glsl */ `
uniform sampler2D uTexture;
uniform float uExposure;    // 1.0 = neutral, > 1.0 = brighter
uniform float uContrast;    // 1.0 = neutral
uniform float uSaturation;  // 1.0 = neutral
varying vec2 vUv;

vec3 aces(vec3 x) {
  const float a = 2.51, b = 0.03, c = 2.43, d = 0.59, e = 0.14;
  return clamp((x*(a*x+b))/(x*(c*x+d)+e), 0.0, 1.0);
}

void main() {
  vec3 color = texture2D(uTexture, vUv).rgb;

  // Exposure
  color *= uExposure;

  // ACES tone map
  color = aces(color);

  // Contrast (S-curve around 0.5)
  color = mix(vec3(0.5), color, uContrast);

  // Saturation via luminance
  float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
  color = mix(vec3(luma), color, uSaturation);

  gl_FragColor = vec4(color, 1.0);
}
`
