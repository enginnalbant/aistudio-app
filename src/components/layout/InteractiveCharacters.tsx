import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

interface CharacterProps {
  position: [number, number, number];
  focusField: 'email' | 'password' | 'none';
  isHoveringSubmit: boolean;
  isError: boolean;
  isSuccess: boolean;
  color: string;
  headScale?: number;
}

function StylizedCharacter({ position, focusField, isHoveringSubmit, isError, isSuccess, color, headScale = 1 }: CharacterProps) {
  const headRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const bodyRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (headRef.current) {
      // 1. Idle Bobbing
      headRef.current.position.y = Math.sin(time * 2 + position[0]) * 0.1;

      // 2. Reacting to Input Focus
      if (isSuccess) {
        // Happily jumping and rotating
        headRef.current.position.y = Math.abs(Math.sin(time * 10)) * 0.5;
        headRef.current.rotation.y = time * 5;
      } else if (isError) {
        // Shaking side to side quickly
        headRef.current.position.x = Math.sin(time * 40) * 0.15;
        headRef.current.rotation.z = Math.sin(time * 40) * 0.1;
      } else if (focusField === 'email') {
        // Curiously leaning forward and looking towards the right (the input panel)
        headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, 0.4, 0.1);
        headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, 0.2, 0.1);
      } else if (focusField === 'password') {
        // Shyly tilting head down or looking away
        headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, -0.4, 0.1);
        headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, -0.3, 0.1);
      } else if (isHoveringSubmit) {
        // Looking straight forward with high interest
        headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, 0, 0.15);
        headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, 0.3, 0.15);
      } else {
        // Smoothly return to center/idle
        headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, Math.sin(time) * 0.1, 0.05);
        headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, 0, 0.05);
      }
    }

    // 3. Shy Eye Closing / Cover for Password Field
    if (leftEyeRef.current && rightEyeRef.current) {
      if (focusField === 'password') {
        // Close eyes by flattening them on the Y axis
        leftEyeRef.current.scale.y = THREE.MathUtils.lerp(leftEyeRef.current.scale.y, 0.05, 0.15);
        rightEyeRef.current.scale.y = THREE.MathUtils.lerp(rightEyeRef.current.scale.y, 0.05, 0.15);
      } else {
        // Standard wide eyes
        leftEyeRef.current.scale.y = THREE.MathUtils.lerp(leftEyeRef.current.scale.y, 1, 0.1);
        rightEyeRef.current.scale.y = THREE.MathUtils.lerp(rightEyeRef.current.scale.y, 1, 0.1);
      }
    }
  });

  return (
    <group position={position}>
      {/* Body / Torso */}
      <mesh ref={bodyRef} position={[0, -1.2, 0]}>
        <cylinderGeometry args={[0.6, 0.8, 1.2, 32]} />
        <meshPhysicalMaterial
          color={color}
          roughness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* Interactive Head Group */}
      <group ref={headRef}>
        {/* Head Sphere */}
        <mesh scale={[headScale, headScale, headScale]}>
          <sphereGeometry args={[0.9, 32, 32]} />
          <meshPhysicalMaterial
            color={color}
            roughness={0.15}
            metalness={0.1}
            clearcoat={1}
          />
        </mesh>

        {/* Left Eye */}
        <mesh ref={leftEyeRef} position={[-0.3, 0.2, 0.75]}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshBasicMaterial color="#FFFFFF" />

          {/* Pupil */}
          <mesh position={[0, 0, 0.1]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
        </mesh>

        {/* Right Eye */}
        <mesh ref={rightEyeRef} position={[0.3, 0.2, 0.75]}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshBasicMaterial color="#FFFFFF" />

          {/* Pupil */}
          <mesh position={[0, 0, 0.1]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
        </mesh>

        {/* Cute Smile / Mouth */}
        <mesh position={[0, -0.2, 0.8]} rotation={[0.1, 0, 0]}>
          <torusGeometry args={[0.15, 0.04, 8, 24, Math.PI]} />
          <meshBasicMaterial color="#000000" />
        </mesh>

        {/* Futuristic Stylized Antenna / Hat */}
        <mesh position={[0, 1.0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.4, 8]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0, 1.2, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshBasicMaterial color="#FFD700" />
        </mesh>
      </group>
    </group>
  );
}

export function InteractiveCharacters({ focusField, isHoveringSubmit, isError, isSuccess }: {
  focusField: 'email' | 'password' | 'none';
  isHoveringSubmit: boolean;
  isError: boolean;
  isSuccess: boolean;
}) {
  return (
    <div className="w-full h-full min-h-[450px] relative">
      {/* Decorative neon ambient spheres behind characters */}
      <div className="absolute inset-0 z-0 bg-radial from-focus-main/20 via-transparent to-transparent pointer-events-none opacity-40 blur-3xl animate-pulse" />

      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <directionalLight position={[-5, 5, 5]} intensity={0.8} />

        {/* Character 1 (Center - Smart Assistant in Vibrant Blue) */}
        <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
          <StylizedCharacter
            position={[0, 0.4, 0]}
            focusField={focusField}
            isHoveringSubmit={isHoveringSubmit}
            isError={isError}
            isSuccess={isSuccess}
            color="#0066FF"
            headScale={1}
          />
        </Float>

        {/* Character 2 (Left - Shy & Playful in Sweet Pink) */}
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
          <StylizedCharacter
            position={[-1.8, -0.4, -0.5]}
            focusField={focusField}
            isHoveringSubmit={isHoveringSubmit}
            isError={isError}
            isSuccess={isSuccess}
            color="#FF0066"
            headScale={0.85}
          />
        </Float>

        {/* Character 3 (Right - Energetic Nerd in Neon Green) */}
        <Float speed={1.8} rotationIntensity={0.15} floatIntensity={0.25}>
          <StylizedCharacter
            position={[1.8, -0.2, -0.5]}
            focusField={focusField}
            isHoveringSubmit={isHoveringSubmit}
            isError={isError}
            isSuccess={isSuccess}
            color="#00FF66"
            headScale={0.9}
          />
        </Float>
      </Canvas>
    </div>
  );
}
