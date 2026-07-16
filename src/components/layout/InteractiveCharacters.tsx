import React, { useRef } from 'react';
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

function HumanoidCharacter({ position, focusField, isHoveringSubmit, isError, isSuccess, color, headScale = 1 }: CharacterProps) {
  const headRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const bodyRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // 1. Idle breathing body sway
    if (bodyRef.current) {
      bodyRef.current.rotation.y = Math.sin(time * 0.5 + position[0]) * 0.05;
      bodyRef.current.position.y = -1.2 + Math.sin(time * 1.5 + position[0]) * 0.02;
    }

    // 2. Head tracking / animations
    if (headRef.current) {
      // Idle bobbing
      headRef.current.position.y = Math.sin(time * 2 + position[0]) * 0.05;

      if (isSuccess) {
        // Happily jumping and rotating
        headRef.current.position.y = Math.abs(Math.sin(time * 12)) * 0.4;
        headRef.current.rotation.y = time * 6;
        headRef.current.rotation.z = Math.sin(time * 6) * 0.2;
      } else if (isError) {
        // Shaking side to side quickly
        headRef.current.position.x = Math.sin(time * 40) * 0.12;
        headRef.current.rotation.z = Math.sin(time * 40) * 0.15;
      } else if (focusField === 'email') {
        // Curiously leaning forward and looking towards the right (the input panel)
        headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, 0.5, 0.1);
        headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, 0.2, 0.1);
        headRef.current.rotation.z = THREE.MathUtils.lerp(headRef.current.rotation.z, 0.1, 0.1);
      } else if (focusField === 'password') {
        // Shyly tilting head down
        headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, -0.4, 0.1);
        headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, -0.2, 0.1);
        headRef.current.rotation.z = THREE.MathUtils.lerp(headRef.current.rotation.z, -0.1, 0.1);
      } else if (isHoveringSubmit) {
        // Looking straight forward with high interest
        headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, 0, 0.15);
        headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, 0.3, 0.15);
        headRef.current.rotation.z = THREE.MathUtils.lerp(headRef.current.rotation.z, 0, 0.15);
      } else {
        // Return to standard idle
        headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, Math.sin(time * 0.8) * 0.1, 0.05);
        headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, 0, 0.05);
        headRef.current.rotation.z = THREE.MathUtils.lerp(headRef.current.rotation.z, 0, 0.05);
      }
    }

    // 3. Eye Reactions
    if (leftEyeRef.current && rightEyeRef.current) {
      if (focusField === 'password') {
        // Shut/flat eyes for secrecy
        leftEyeRef.current.scale.y = THREE.MathUtils.lerp(leftEyeRef.current.scale.y, 0.05, 0.15);
        rightEyeRef.current.scale.y = THREE.MathUtils.lerp(rightEyeRef.current.scale.y, 0.05, 0.15);
      } else if (isError) {
        // Scared / squinted eyes
        leftEyeRef.current.scale.y = THREE.MathUtils.lerp(leftEyeRef.current.scale.y, 0.3, 0.15);
        rightEyeRef.current.scale.y = THREE.MathUtils.lerp(rightEyeRef.current.scale.y, 0.3, 0.15);
      } else {
        // Standard wide eyes
        leftEyeRef.current.scale.y = THREE.MathUtils.lerp(leftEyeRef.current.scale.y, 1, 0.1);
        rightEyeRef.current.scale.y = THREE.MathUtils.lerp(rightEyeRef.current.scale.y, 1, 0.1);
      }
    }

    // 4. Arms movement/poses
    if (leftArmRef.current && rightArmRef.current) {
      if (isSuccess) {
        // Cheers pose: Raise both arms up and wave
        leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, Math.PI - 0.4 + Math.sin(time * 12) * 0.3, 0.15);
        rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, -Math.PI + 0.4 - Math.sin(time * 12) * 0.3, 0.15);
        leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 0, 0.15);
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0, 0.15);
      } else if (isError) {
        // Covering head / Facepalm disappointment pose
        leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, 2.0, 0.2);
        leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 1.2, 0.2);
        rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, -2.0, 0.2);
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 1.2, 0.2);
      } else if (focusField === 'email') {
        // Waving at the input field curiously
        leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, 0.5, 0.1);
        leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 0.2, 0.1);
        rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, -1.8 + Math.sin(time * 10) * 0.4, 0.15);
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0.5, 0.15);
      } else if (focusField === 'password') {
        // Shyly covering eyes
        leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, 1.8, 0.15);
        leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 1.1, 0.15);
        rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, -1.8, 0.15);
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 1.1, 0.15);
      } else if (isHoveringSubmit) {
        // Cheerfully pointing forward
        leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, 1.2, 0.15);
        rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, -1.2, 0.15);
        leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 0.5, 0.15);
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0.5, 0.15);
      } else {
        // Idle sway arms slightly
        leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, 0.2 + Math.sin(time * 1.5) * 0.05, 0.05);
        leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 0, 0.05);
        rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, -0.2 - Math.sin(time * 1.5) * 0.05, 0.05);
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0, 0.05);
      }
    }

    // 5. Legs marching / bouncing
    if (leftLegRef.current && rightLegRef.current) {
      if (isSuccess) {
        // Hyper marching jump
        leftLegRef.current.rotation.x = Math.sin(time * 15) * 0.4;
        rightLegRef.current.rotation.x = -Math.sin(time * 15) * 0.4;
      } else if (isError) {
        // Frozen stiff legs
        leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0, 0.15);
        rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, 0, 0.15);
      } else {
        // Subtle idle legs shuffle
        leftLegRef.current.rotation.x = Math.sin(time * 0.8) * 0.05;
        rightLegRef.current.rotation.x = -Math.sin(time * 0.8) * 0.05;
      }
    }
  });

  return (
    <group position={position}>
      {/* 1. Body / Torso (Clean rounded cylinder capsule) */}
      <mesh ref={bodyRef} position={[0, -1.2, 0]}>
        <cylinderGeometry args={[0.5, 0.4, 1.2, 32]} />
        <meshPhysicalMaterial
          color={color}
          roughness={0.15}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* 2. Interactive Head Group */}
      <group ref={headRef}>
        {/* Head Sphere */}
        <mesh scale={[headScale, headScale, headScale]}>
          <sphereGeometry args={[0.85, 32, 32]} />
          <meshPhysicalMaterial
            color={color}
            roughness={0.2}
            metalness={0.1}
            clearcoat={1}
          />
        </mesh>

        {/* Left Eye */}
        <mesh ref={leftEyeRef} position={[-0.26, 0.18, 0.72]}>
          <sphereGeometry args={[0.16, 16, 16]} />
          <meshBasicMaterial color="#FFFFFF" />

          {/* Pupil */}
          <mesh position={[0, 0, 0.09]}>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
        </mesh>

        {/* Right Eye */}
        <mesh ref={rightEyeRef} position={[0.26, 0.18, 0.72]}>
          <sphereGeometry args={[0.16, 16, 16]} />
          <meshBasicMaterial color="#FFFFFF" />

          {/* Pupil */}
          <mesh position={[0, 0, 0.09]}>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
        </mesh>

        {/* Cute Smile / Mouth */}
        <mesh position={[0, -0.18, 0.76]} rotation={[0.08, 0, 0]}>
          <torusGeometry args={[0.14, 0.035, 8, 24, Math.PI]} />
          <meshBasicMaterial color="#000000" />
        </mesh>

        {/* Futuristic Stylized Hat / Antenna */}
        <mesh position={[0, 0.95, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.35, 8]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0, 1.15, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial color="#FFD700" />
        </mesh>
      </group>

      {/* 3. Humanoid Movable Arms (Linked shoulders to elbows) */}
      {/* Left Arm Joint */}
      <group ref={leftArmRef} position={[-0.65, -0.9, 0]}>
        <mesh position={[-0.15, -0.4, 0]}>
          <cylinderGeometry args={[0.1, 0.08, 0.8, 16]} />
          <meshPhysicalMaterial color={color} roughness={0.2} clearcoat={1} />
        </mesh>
        {/* Left Hand Globe */}
        <mesh position={[-0.15, -0.85, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
      </group>

      {/* Right Arm Joint */}
      <group ref={rightArmRef} position={[0.65, -0.9, 0]}>
        <mesh position={[0.15, -0.4, 0]}>
          <cylinderGeometry args={[0.08, 0.1, 0.8, 16]} />
          <meshPhysicalMaterial color={color} roughness={0.2} clearcoat={1} />
        </mesh>
        {/* Right Hand Globe */}
        <mesh position={[0.15, -0.85, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
      </group>

      {/* 4. Humanoid Movable Legs */}
      {/* Left Leg */}
      <mesh ref={leftLegRef} position={[-0.22, -2.1, 0]}>
        <cylinderGeometry args={[0.12, 0.1, 0.8, 16]} />
        <meshPhysicalMaterial color="#333333" roughness={0.5} />
        {/* Left Shoe */}
        <mesh position={[0, -0.42, 0.1]}>
          <boxGeometry args={[0.2, 0.15, 0.35]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
      </mesh>

      {/* Right Leg */}
      <mesh ref={rightLegRef} position={[0.22, -2.1, 0]}>
        <cylinderGeometry args={[0.12, 0.1, 0.8, 16]} />
        <meshPhysicalMaterial color="#333333" roughness={0.5} />
        {/* Right Shoe */}
        <mesh position={[0, -0.42, 0.1]}>
          <boxGeometry args={[0.2, 0.15, 0.35]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
      </mesh>
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

      <Canvas camera={{ position: [0, -0.5, 4.8], fov: 50 }}>
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <directionalLight position={[-5, 5, 5]} intensity={0.8} />

        {/* Character 1 (Center - Smart Assistant in Vibrant Blue) */}
        <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
          <HumanoidCharacter
            position={[0, 0.5, 0]}
            focusField={focusField}
            isHoveringSubmit={isHoveringSubmit}
            isError={isError}
            isSuccess={isSuccess}
            color="#0066FF"
            headScale={1.05}
          />
        </Float>

        {/* Character 2 (Left - Shy & Playful in Sweet Pink) */}
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
          <HumanoidCharacter
            position={[-1.8, -0.2, -0.4]}
            focusField={focusField}
            isHoveringSubmit={isHoveringSubmit}
            isError={isError}
            isSuccess={isSuccess}
            color="#FF0066"
            headScale={0.9}
          />
        </Float>

        {/* Character 3 (Right - Energetic Nerd in Neon Green) */}
        <Float speed={1.8} rotationIntensity={0.15} floatIntensity={0.25}>
          <HumanoidCharacter
            position={[1.8, -0.1, -0.4]}
            focusField={focusField}
            isHoveringSubmit={isHoveringSubmit}
            isError={isError}
            isSuccess={isSuccess}
            color="#00FF66"
            headScale={0.95}
          />
        </Float>
      </Canvas>
    </div>
  );
}
