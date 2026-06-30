import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Points, PointMaterial, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useSettings } from '../context/SettingsContext';
import { useWeather } from '../hooks/useWeather';
import { useDevice } from '../hooks/useDevice';

function AnimatedSphere({ color, distort = 0.4, speed = 2, scale = 2 }: { color: string, distort?: number, speed?: number, scale?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      const time = performance.now() * 0.001;
      meshRef.current.rotation.x = time * 0.2;
      meshRef.current.rotation.y = time * 0.3;
    }
  });

  return (
    <Float speed={speed} rotationIntensity={1} floatIntensity={1}>
      <Sphere ref={meshRef} args={[1, 32, 32]} scale={scale}>
        <MeshDistortMaterial
          color={color}
          speed={speed}
          distort={distort}
          radius={1}
          opacity={0.1}
          transparent
        />
      </Sphere>
    </Float>
  );
}

function Advanced3D() {
  return (
    <>
      <AnimatedSphere color="#0066FF" distort={0.6} speed={3} scale={2.5} />
      <group position={[3, 2, -2]}>
        <AnimatedSphere color="#FF0066" distort={0.4} speed={1.5} scale={1} />
      </group>
      <group position={[-3, -2, -1]}>
        <AnimatedSphere color="#00FF66" distort={0.5} speed={2} scale={1.2} />
      </group>
    </>
  );
}

function Rain({ count = 1000 }) {
  const pointsRef = useRef<THREE.Points>(null);
  const { isMobile } = useDevice();
  const rainCount = isMobile ? Math.floor(count / 3) : count;
  
  const positions = useMemo(() => {
    const pos = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = Math.random() * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, [rainCount]);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < rainCount; i++) {
        positions[i * 3 + 1] -= delta * 15;
        if (positions[i * 3 + 1] < -10) {
          positions[i * 3 + 1] = 10;
        }
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3}>
      <PointMaterial
        transparent
        color="#82B1FF"
        size={0.08}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.4}
      />
    </Points>
  );
}

function WeatherBackground() {
  const weather = useWeather();
  const { isMobile } = useDevice();
  
  const bgColors = {
    dawn: ['#FF9E80', '#FFD180'],
    day: ['#82B1FF', '#E3F2FD'],
    dusk: ['#311B92', '#FF4081'],
    night: ['#0D47A1', '#000000'],
  };

  const colors = bgColors[weather.timeOfDay];

  return (
    <>
      <color attach="background" args={[colors[0]]} />
      <fog attach="fog" args={[colors[0], 5, 15]} />
      
      {/* Sun or Moon */}
      <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
        <Sphere args={[1, 16, 16]} position={[5, 5, -5]}>
          <meshBasicMaterial color={weather.isDay ? '#FFF176' : '#ECEFF1'} />
        </Sphere>
      </Float>

      {weather.condition === 'rain' && <Rain />}
      {weather.condition === 'storm' && <Rain count={isMobile ? 800 : 2000} />}
      
      <AnimatedSphere 
        color={weather.isDay ? '#FFFFFF' : '#424242'} 
        distort={0.2} 
        speed={1} 
        scale={3} 
      />
    </>
  );
}

function ParticleField({ color = "#82B1FF" }) {
  const pointsRef = useRef<THREE.Points>(null);
  const { isMobile } = useDevice();
  const count = isMobile ? 300 : 1000;
  
  const positions = React.useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return pos;
  }, [count]);

  useFrame(() => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = performance.now() * 0.001 * 0.05;
    }
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3}>
      <PointMaterial
        transparent
        color={color}
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.2}
      />
    </Points>
  );
}

export const SpatialBackground = React.memo(function SpatialBackground() {
  const { settings } = useSettings();
  const { isMobile } = useDevice();

  return (
    <div className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-1000">
      <Canvas 
        camera={{ position: [0, 0, 5], fov: 75 }}
        dpr={isMobile ? [1, 1.5] : [1, 2]} // Lower resolution on mobile for FPS
        gl={{ antialias: !isMobile, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        {settings['background_type']?.value === 'default' && (
          <>
            <AnimatedSphere color="#0066FF" />
            <ParticleField />
          </>
        )}

        {settings['background_type']?.value === '3d-advanced' && (
          <>
            <Advanced3D />
            <ParticleField color="#FF0066" />
          </>
        )}

        {settings['background_type']?.value === 'accent-synced' && (
          <>
            <AnimatedSphere color={settings['accent_color']?.value} />
            <ParticleField color={settings['accent_color']?.value} />
          </>
        )}

        {settings['background_type']?.value === 'live-weather' && (
          <WeatherBackground />
        )}
      </Canvas>
    </div>
  );
});

