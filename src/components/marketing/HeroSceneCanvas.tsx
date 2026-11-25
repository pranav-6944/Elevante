"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type * as THREE from "three";

function ElevanteSculpture() {
  const outerRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    if (outerRef.current) {
      outerRef.current.rotation.y += delta * 0.28;
      outerRef.current.rotation.x = Math.sin(t * 0.45) * 0.22;
    }
    if (innerRef.current) {
      innerRef.current.rotation.y -= delta * 0.35;
      innerRef.current.rotation.z += delta * 0.18;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.15;
    }
  });

  return (
    <group>
      <mesh ref={outerRef}>
        <icosahedronGeometry args={[1.55, 1]} />
        <meshStandardMaterial
          color="#245B70"
          wireframe
          transparent
          opacity={0.78}
          roughness={0.3}
          metalness={0.5}
        />
      </mesh>

      <mesh ref={innerRef}>
        <octahedronGeometry args={[0.92, 0]} />
        <meshStandardMaterial
          color="#17264F"
          roughness={0.25}
          metalness={0.65}
          emissive="#1a3b5c"
          emissiveIntensity={0.45}
        />
      </mesh>

      <mesh ref={ringRef} rotation={[Math.PI / 3, 0.35, 0]}>
        <torusGeometry args={[2.05, 0.032, 16, 80]} />
        <meshStandardMaterial
          color="#319C78"
          emissive="#319C78"
          emissiveIntensity={0.4}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
}

export default function HeroSceneCanvas({ onWebGLError }: { onWebGLError: () => void }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 5.2], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener(
          "webglcontextlost",
          (event) => {
            event.preventDefault();
            onWebGLError();
          },
          false
        );
      }}
    >
      <ambientLight intensity={0.85} />
      <directionalLight position={[4, 5, 4]} intensity={1.4} color="#ffffff" />
      <pointLight position={[-4, -3, 3]} intensity={1.1} color="#319C78" />
      <ElevanteSculpture />
    </Canvas>
  );
}
