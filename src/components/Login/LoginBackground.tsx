import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Stars, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

function AnimatedShape({ color, position, scale, distort }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      meshRef.current.rotation.x = time * 0.2;
      meshRef.current.rotation.y = time * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1} position={position}>
      <Sphere ref={meshRef} args={[1, 64, 64]} scale={scale}>
        <MeshDistortMaterial
          color={color}
          speed={2}
          distort={distort}
          radius={1}
          opacity={0.15}
          transparent
        />
      </Sphere>
    </Float>
  );
}

const LoginBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 bg-zinc-950">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={75} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} color="#4f46e5" intensity={1} />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <AnimatedShape color="#4f46e5" position={[-4, 2, -5]} scale={3} distort={0.6} />
        <AnimatedShape color="#ec4899" position={[4, -2, -5]} scale={2.5} distort={0.4} />
        <AnimatedShape color="#06b6d4" position={[0, 0, -8]} scale={4} distort={0.5} />
        
        <fog attach="fog" args={['#09090b', 5, 20]} />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/50 to-zinc-950 pointer-events-none" />
    </div>
  );
};

export default LoginBackground;
