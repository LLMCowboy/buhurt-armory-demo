'use client'

import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing'
import * as THREE from 'three'
import { CURL_NOISE, HASH } from '../../lib/glsl/chunks.ts'

const SIM_SIZE = 128 // 128×128 = 16,384 particles

const simVertShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

const simFragShader = `
precision highp float;

uniform sampler2D uPositions;
uniform float uTime;
uniform float uDelta;
uniform float uSpeed;

varying vec2 vUv;

${CURL_NOISE}
${HASH}

void main() {
  vec4 data = texture2D(uPositions, vUv);
  vec3 pos = data.xyz;
  float life = data.w;

  vec3 velocity = curlNoise(pos * 0.4 + uTime * 0.08) * uSpeed;
  velocity += curlNoise(pos * 1.2 - uTime * 0.03) * uSpeed * 0.3;

  pos += velocity * uDelta;

  life -= uDelta * 0.12;
  if (life <= 0.0 || length(pos) > 6.0) {
    float r1 = hash21(vUv + fract(uTime * 0.1));
    float r2 = hash21(vUv + fract(uTime * 0.1) + vec2(0.3, 0.7));
    float r3 = hash21(vUv + fract(uTime * 0.1) + vec2(0.6, 0.2));
    float theta = r1 * 6.28318;
    float phi = acos(2.0 * r2 - 1.0);
    float radius = pow(r3, 1.0/3.0) * 3.0;
    pos = vec3(
      radius * sin(phi) * cos(theta),
      radius * sin(phi) * sin(theta),
      radius * cos(phi)
    );
    life = 0.5 + r1 * 0.5;
  }

  gl_FragColor = vec4(pos, life);
}
`

const renderVertShader = `
uniform sampler2D uPositions;
uniform float uSize;
uniform float uTime;

attribute vec2 aParticleUV;

varying float vLife;
varying float vDepth;

void main() {
  vec4 data = texture2D(uPositions, aParticleUV);
  vec3 pos = data.xyz;
  vLife = data.w;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  vDepth = -mvPosition.z;

  gl_PointSize = uSize * (400.0 / vDepth) * vLife;
  gl_Position = projectionMatrix * mvPosition;
}
`

const renderFragShader = `
precision mediump float;

uniform vec3 uColor;
varying float vLife;
varying float vDepth;

void main() {
  vec2 coord = gl_PointCoord - 0.5;
  float dist = length(coord);
  if (dist > 0.5) discard;

  float strength = pow(1.0 - dist * 2.0, 2.0);
  float alpha = strength * vLife * 0.8;

  gl_FragColor = vec4(uColor, alpha);
  #include <colorspace_fragment>
}
`

function SimulationScene({ color = '#ea580c', speed = 1.0 }) {
  const { gl, size } = useThree()

  const rtA = useRef()
  const rtB = useRef()

  const simScene = useRef(new THREE.Scene())
  const simCamera = useRef(new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1))

  const simMaterial = useRef()
  const renderMaterial = useRef()
  const pointsRef = useRef()

  useEffect(() => {
    const opts = {
      width: SIM_SIZE,
      height: SIM_SIZE,
      type: THREE.FloatType,
      format: THREE.RGBAFormat,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
    }
    rtA.current = new THREE.WebGLRenderTarget(SIM_SIZE, SIM_SIZE, opts)
    rtB.current = new THREE.WebGLRenderTarget(SIM_SIZE, SIM_SIZE, opts)

    const data = new Float32Array(SIM_SIZE * SIM_SIZE * 4)
    for (let i = 0; i < SIM_SIZE * SIM_SIZE; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = Math.pow(Math.random(), 1 / 3) * 3
      data[i * 4 + 0] = r * Math.sin(phi) * Math.cos(theta)
      data[i * 4 + 1] = r * Math.sin(phi) * Math.sin(theta)
      data[i * 4 + 2] = r * Math.cos(phi)
      data[i * 4 + 3] = Math.random()
    }
    const initTexture = new THREE.DataTexture(data, SIM_SIZE, SIM_SIZE, THREE.RGBAFormat, THREE.FloatType)
    initTexture.needsUpdate = true

    const simMat = new THREE.ShaderMaterial({
      vertexShader: simVertShader,
      fragmentShader: simFragShader,
      uniforms: {
        uPositions: { value: initTexture },
        uTime: { value: 0 },
        uDelta: { value: 0.016 },
        uSpeed: { value: speed },
      },
    })
    simMaterial.current = simMat

    const simMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), simMat)
    simScene.current.add(simMesh)

    gl.setRenderTarget(rtA.current)
    gl.render(simScene.current, simCamera.current)
    gl.setRenderTarget(rtB.current)
    gl.render(simScene.current, simCamera.current)
    gl.setRenderTarget(null)

    const c = new THREE.Color(color)

    const renderMat = new THREE.ShaderMaterial({
      vertexShader: renderVertShader,
      fragmentShader: renderFragShader,
      uniforms: {
        uPositions: { value: rtA.current.texture },
        uSize: { value: 2.5 },
        uTime: { value: 0 },
        uColor: { value: new THREE.Vector3(c.r, c.g, c.b) },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    renderMaterial.current = renderMat

    const particleCount = SIM_SIZE * SIM_SIZE
    const uvs = new Float32Array(particleCount * 2)
    for (let i = 0; i < SIM_SIZE; i++) {
      for (let j = 0; j < SIM_SIZE; j++) {
        const idx = i * SIM_SIZE + j
        uvs[idx * 2 + 0] = j / (SIM_SIZE - 1)
        uvs[idx * 2 + 1] = i / (SIM_SIZE - 1)
      }
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(particleCount * 3), 3))
    geo.setAttribute('aParticleUV', new THREE.BufferAttribute(uvs, 2))
    pointsRef.current = new THREE.Points(geo, renderMat)

    return () => {
      rtA.current?.dispose()
      rtB.current?.dispose()
      initTexture.dispose()
      simMat.dispose()
      renderMat.dispose()
      geo.dispose()
    }
  }, [])

  useFrame(({ gl, scene, camera }, delta) => {
    const d = Math.min(delta, 0.05)
    if (!rtA.current || !rtB.current || !simMaterial.current || !renderMaterial.current) return

    simMaterial.current.uniforms.uTime.value += d
    simMaterial.current.uniforms.uDelta.value = d
    simMaterial.current.uniforms.uPositions.value = rtB.current.texture

    gl.setRenderTarget(rtA.current)
    gl.render(simScene.current, simCamera.current)
    gl.setRenderTarget(null)

    renderMaterial.current.uniforms.uPositions.value = rtA.current.texture
    renderMaterial.current.uniforms.uTime.value += d

    const tmp = rtA.current
    rtA.current = rtB.current
    rtB.current = tmp
  })

  return pointsRef.current ? <primitive object={pointsRef.current} /> : null
}

export function PingPongSim({ color = '#ea580c', speed = 1.0, className }) {
  return (
    <div className={className}>
      <Canvas
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 8], fov: 50 }}
        frameloop="always"
      >
        <SimulationScene color={color} speed={speed} />
        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={2.5} mipmapBlur />
          <Noise opacity={0.15} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
