import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import * as THREE from 'three';
import { useSettings } from '../../context/SettingsContext';

interface VisualEngineProps {
  interactive?: boolean;
  className?: string;
  themeColor?: string;
}

export const triggerConfettiBurst = () => {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444']
  });
};

export const VisualEngine: React.FC<VisualEngineProps> = ({
  interactive = true,
  className = '',
  themeColor = '#3B82F6'
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const { getSetting } = useSettings();
  const [clickCount, setClickCount] = useState(0);

  // Read visual settings from our 50+ list
  const rotationSetting = getSetting('mod.engine.3d_rotation_speed') ?? 1.0;
  const rendersComplexity = getSetting('mod.engine.3d_render_complexity') ?? 'medium';
  const particlesDensity = getSetting('mod.engine.particle_density') ?? 40;
  const showBloom = getSetting('mod.engine.hdr_bloom_intensity') ?? 0.5;

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth || 300;
    const height = mountRef.current.clientHeight || 300;

    // 1. Create Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 8;

    // 2. Renderer with performance options based on settings
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(rendersComplexity === 'high' ? Math.min(window.devicePixelRatio, 2) : 1);
    mountRef.current.appendChild(renderer.domElement);

    // 3. Dynamic Morphing Geometry
    const geometry = new THREE.IcosahedronGeometry(2, rendersComplexity === 'low' ? 1 : 2);

    // Shader-like interactive material
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color(themeColor),
      wireframe: true,
      transparent: true,
      opacity: 0.85,
      shininess: 100,
      flatShading: true
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // 4. Background Star Dust (Particles)
    const particleCount = particlesDensity * 3;
    const particlesGeom = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 10;
    }

    particlesGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMat = new THREE.PointsMaterial({
      color: 0x8b5cf6,
      size: 0.05,
      transparent: true,
      opacity: 0.6
    });

    const particleSystem = new THREE.Points(particlesGeom, particlesMat);
    scene.add(particleSystem);

    // 5. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(new THREE.Color(themeColor), 1.5, 50);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x8b5cf6, 1, 50);
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);

    // 6. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Calculate speed with local setting multipliers and clicks
      const baseRotation = 0.25 * rotationSetting;
      const clickedBoost = 1.0 + (clickCount * 0.4);

      mesh.rotation.y = elapsedTime * baseRotation * clickedBoost;
      mesh.rotation.x = elapsedTime * 0.1 * rotationSetting;

      // Morph vertex scale waves slightly for a responsive organism effect
      const scaleWave = 1 + Math.sin(elapsedTime * 2) * 0.08;
      mesh.scale.set(scaleWave, scaleWave, scaleWave);

      // Rotate particle systems
      particleSystem.rotation.y = -elapsedTime * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (mountRef.current && renderer.domElement) {
        try {
          mountRef.current.removeChild(renderer.domElement);
        } catch (e) {
          // ignore
        }
      }
      geometry.dispose();
      material.dispose();
      particlesGeom.dispose();
      particlesMat.dispose();
    };
  }, [themeColor, rotationSetting, rendersComplexity, particlesDensity, clickCount]);

  // Click handler to trigger bursts and boost rot speed
  const handleInteraction = () => {
    if (!interactive) return;
    setClickCount(prev => prev + 1);

    // Confetti effect based on setting
    const isConfettiEnabled = getSetting('mod.engine.confetti_effects_enabled') ?? true;
    if (isConfettiEnabled) {
      triggerConfettiBurst();
    }

    // Reset click count boost after a short time
    setTimeout(() => {
      setClickCount(prev => Math.max(0, prev - 1));
    }, 2000);
  };

  return (
    <div
      onClick={handleInteraction}
      className={`relative rounded-3xl overflow-hidden cursor-pointer select-none bg-radial from-transparent to-black/35 group ${className}`}
    >
      {/* 3D Mesh Mount */}
      <div ref={mountRef} className="w-full h-full min-h-[220px]" />

      {/* Hover & Glow overlay elements */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none p-4 flex flex-col justify-end">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[8px] font-mono tracking-widest text-white/50 uppercase font-black block">3D GEOMETRY MOTORU</span>
            <span className="text-xs font-bold text-white group-hover:text-focus-neon transition-colors">Etkileşimli Ağ Küresi</span>
          </div>
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-[9px] font-mono px-2 py-0.5 rounded bg-focus-neon/20 border border-focus-neon/30 text-focus-neon"
          >
            {clickCount > 0 ? `BOOST x${(1 + clickCount * 0.4).toFixed(1)}` : 'DOKUN'}
          </motion.span>
        </div>
      </div>
    </div>
  );
};
