import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function AnimatedSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      const time = performance.now() * 0.001;
      meshRef.current.rotation.x = time * 0.2;
      meshRef.current.rotation.y = time * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <Sphere ref={meshRef} args={[1, 64, 64]} scale={2}>
        <MeshDistortMaterial
          color="#0066FF"
          speed={2}
          distort={0.4}
          radius={1}
          opacity={0.1}
          transparent
        />
      </Sphere>
    </Float>
  );
}

function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 1000;
  
  const positions = React.useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return pos;
  }, []);

  useFrame(() => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = performance.now() * 0.001 * 0.05;
    }
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3}>
      <PointMaterial
        transparent
        color="#82B1FF"
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.2}
      />
    </Points>
  );
}

export function SpatialBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <AnimatedSphere />
        <ParticleField />
      </Canvas>
    </div>
  );
}
