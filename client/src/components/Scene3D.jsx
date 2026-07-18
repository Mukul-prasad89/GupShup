import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

function Orb({ position, scale, speed }) {
  const ref = useRef()
  const y0 = position[1]

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed
    ref.current.rotation.x = t * 0.08
    ref.current.rotation.y = t * 0.12
    ref.current.position.y = y0 + Math.sin(t * 0.4) * 0.3
  })

  return (
    <mesh ref={ref} position={position} scale={scale}>
      <icosahedronGeometry args={[1, 2]} />
      <meshStandardMaterial
        color="#d4d4d8"
        roughness={0.6}
        metalness={0.1}
        transparent
        opacity={0.08}
        wireframe
      />
    </mesh>
  )
}

function SoftShape({ position, scale, speed, geo }) {
  const ref = useRef()
  const y0 = position[1]

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed
    ref.current.rotation.x = t * 0.05
    ref.current.rotation.y = t * 0.08
    ref.current.position.y = y0 + Math.sin(t * 0.3) * 0.2
  })

  return (
    <mesh ref={ref} position={position} scale={scale} geometry={geo}>
      <meshStandardMaterial
        color="#f4f4f5"
        roughness={0.8}
        metalness={0}
        transparent
        opacity={0.04}
      />
    </mesh>
  )
}

function Particles({ count = 120 }) {
  const ref = useRef()

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10
    }
    return pos
  }, [count])

  useFrame((state) => {
    ref.current.rotation.y = state.clock.elapsedTime * 0.01
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.015} color="#a1a1aa" transparent opacity={0.35} sizeAttenuation depthWrite={false} />
    </points>
  )
}

function MouseCamera() {
  const { camera } = useThree()
  const target = useRef({ x: 0, y: 0 })
  const current = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handler = (e) => {
      target.current.x = (e.clientX / window.innerWidth - 0.5) * 2
      target.current.y = -(e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', handler, { passive: true })
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    current.current.x += (target.current.x - current.current.x) * 0.02
    current.current.y += (target.current.y - current.current.y) * 0.02
    camera.position.x = Math.sin(t * 0.05) * 0.3 + current.current.x * 1.5
    camera.position.y = Math.cos(t * 0.04) * 0.2 + current.current.y * 1
    camera.lookAt(0, 0, 0)
  })

  return null
}

const geos = {
  sphere: new THREE.SphereGeometry(1, 32, 32),
  torus: new THREE.TorusGeometry(1, 0.3, 24, 64),
  ico: new THREE.IcosahedronGeometry(1, 1),
  octa: new THREE.OctahedronGeometry(1, 1),
}

export default function Scene3D() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
      >
        <color attach="background" args={['#09090b']} />

        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={0.5} color="#fafafa" />
        <pointLight position={[-3, 2, 2]} intensity={1.5} color="#e4e4e7" distance={15} />
        <pointLight position={[3, -1, 3]} intensity={1} color="#d4d4d8" distance={12} />

        <Orb position={[-3, 1, -3]} scale={2} speed={0.15} />
        <Orb position={[3.5, -1, -4]} scale={1.5} speed={0.12} />
        <Orb position={[0, 2.5, -5]} scale={2.5} speed={0.1} />

        <SoftShape position={[2, -0.5, -2]} scale={1.2} speed={0.2} geo={geos.sphere} />
        <SoftShape position={[-2.5, -1.5, -3]} scale={0.8} speed={0.18} geo={geos.torus} />
        <SoftShape position={[1, 2, -4]} scale={1} speed={0.15} geo={geos.ico} />
        <SoftShape position={[-1, -2.5, -2.5]} scale={0.7} speed={0.22} geo={geos.octa} />

        <Particles count={100} />

        <MouseCamera />
      </Canvas>
    </div>
  )
}