"use client";

import React, { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { SPACES_DATA, SpaceData } from "@/data/spaces";
import { spaceAudio } from "@/lib/audio-synth";

// Stars background component
function CosmicBackground() {
  const count = 2500;

  const geometry = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 100 + Math.random() * 80;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return geo;
  }, []);

  return (
    <points geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        size={0.7}
        color="#ffffff"
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

// Glowing Sun component
function SunMesh({ onSelect, onOpenDetail }: { onSelect: () => void; onOpenDetail?: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const lastClickRef = useRef<number>(0);

  const handleInteraction = (e: any) => {
    e?.stopPropagation?.();
    const now = Date.now();
    if (now - lastClickRef.current < 350) {
      lastClickRef.current = 0;
      onOpenDetail?.();
    } else {
      lastClickRef.current = now;
      onSelect();
    }
  };

  const handleDoubleClick = (e: any) => {
    e?.stopPropagation?.();
    onOpenDetail?.();
  };

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1;
    }
    if (glowRef.current) {
      glowRef.current.rotation.z -= delta * 0.05;
    }
  });

  return (
    <group onClick={handleInteraction} onDoubleClick={handleDoubleClick}>
      {/* Central Sun */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[3.2, 64, 64]} />
        <meshBasicMaterial color="#ff9900" />
      </mesh>

      {/* Corona Glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[3.7, 32, 32]} />
        <meshBasicMaterial
          color="#ff4400"
          transparent
          opacity={0.35}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Sun Label */}
      <Html position={[0, 4.2, 0]} center distanceFactor={25}>
        <div
          onClick={handleInteraction}
          onDoubleClick={handleDoubleClick}
          className="cursor-pointer pointer-events-auto px-2.5 py-1 rounded-full bg-amber-500/80 text-white font-bold text-xs shadow-lg backdrop-blur-sm border border-amber-300 flex items-center gap-1 animate-pulse hover:scale-105 transition"
        >
          ☀️ Mặt Trời
        </div>
      </Html>

      {/* Point light from Sun */}
      <pointLight intensity={3.5} distance={100} decay={0.5} color="#fff7ed" />
    </group>
  );
}

// Orbit Line Ring Component
function OrbitLine({ distance }: { distance: number }) {
  const ringMesh = useMemo(() => {
    const geometry = new THREE.RingGeometry(distance - 0.08, distance + 0.08, 96);
    const material = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = Math.PI / 2;
    return mesh;
  }, [distance]);

  return <primitive object={ringMesh} />;
}

// Planet Component
function Planet({
  space,
  onSelect,
  onOpenDetail,
  isSelected,
  simulationSpeed,
}: {
  space: SpaceData;
  onSelect: (space: SpaceData) => void;
  onOpenDetail?: (space: SpaceData) => void;
  isSelected: boolean;
  simulationSpeed: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const lastClickRef = useRef<number>(0);

  const handleInteraction = (e: any) => {
    e?.stopPropagation?.();
    const now = Date.now();
    if (now - lastClickRef.current < 350) {
      lastClickRef.current = 0;
      spaceAudio.playWarpSound();
      onOpenDetail?.(space);
    } else {
      lastClickRef.current = now;
      spaceAudio.playWarpSound();
      onSelect(space);
    }
  };

  const handleDoubleClick = (e: any) => {
    e?.stopPropagation?.();
    spaceAudio.playWarpSound();
    onOpenDetail?.(space);
  };

  // Random initial angle to disperse planets
  const initialAngle = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame(({ clock }) => {
    if (groupRef.current && space.planet3d.distance > 0) {
      const t = clock.getElapsedTime() * space.planet3d.speed * simulationSpeed + initialAngle;
      groupRef.current.position.x = Math.cos(t) * space.planet3d.distance;
      groupRef.current.position.z = Math.sin(t) * space.planet3d.distance;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.015;
    }
  });

  const { size, color, ring, ringColor, ringInnerRadius, ringOuterRadius } = space.planet3d;

  return (
    <group ref={groupRef}>
      {/* Planet Mesh */}
      <mesh
        ref={meshRef}
        scale={hovered || isSelected ? 1.35 : 1}
        onClick={handleInteraction}
        onDoubleClick={handleDoubleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "default";
        }}
      >
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={color}
          roughness={0.6}
          metalness={0.2}
          emissive={isSelected || hovered ? color : "#000000"}
          emissiveIntensity={hovered ? 0.4 : 0.15}
        />
      </mesh>

      {/* Saturn Rings */}
      {ring && (
        <mesh rotation={[-Math.PI / 2.3, 0, 0]}>
          <ringGeometry args={[ringInnerRadius || size * 1.4, ringOuterRadius || size * 2.3, 64]} />
          <meshStandardMaterial
            color={ringColor || "#fde047"}
            side={THREE.DoubleSide}
            transparent
            opacity={0.8}
            roughness={0.4}
          />
        </mesh>
      )}

      {/* Selection Glow Indicator */}
      {(hovered || isSelected) && (
        <mesh>
          <sphereGeometry args={[size * 1.5, 16, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.25} wireframe />
        </mesh>
      )}

      {/* Floating Tag / Label */}
      <Html position={[0, size + 0.8, 0]} center distanceFactor={22}>
        <div
          onClick={handleInteraction}
          onDoubleClick={handleDoubleClick}
          className={`cursor-pointer whitespace-nowrap transition-all duration-200 select-none px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md border ${
            isSelected
              ? "bg-cyan-500 text-white border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.8)] scale-110"
              : hovered
              ? "bg-slate-800/90 text-cyan-300 border-cyan-400 scale-105"
              : "bg-slate-900/60 text-slate-300 border-slate-700/50 hover:bg-slate-800"
          }`}
        >
          {space.name}
        </div>
      </Html>
    </group>
  );
}

interface SolarSystemCanvasProps {
  onSelectSpace: (space: SpaceData) => void;
  onOpenDetail?: (space: SpaceData) => void;
  selectedSpace: SpaceData | null;
  speed: number;
}

function WebGLFallback({ label }: { label: string }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-slate-950 via-slate-900 to-black text-center px-6">
      <div className="text-5xl">🪐</div>
      <div className="text-slate-200 font-semibold">Không thể render 3D: {label}</div>
      <p className="text-sm text-slate-400 max-w-md">
        Trình duyệt hoặc thiết bị hiện tại chưa hỗ trợ WebGL đầy đủ. Hãy thử lại,
        cập nhật trình duyệt, hoặc mở chế độ tiết kiệm pin của GPU.
      </p>
    </div>
  );
}

function SceneErrorBoundary({ children }: { children: React.ReactNode }) {
  const [err, setErr] = React.useState<string | null>(null);
  if (err) return <WebGLFallback label={err} />;
  return (
    <ErrorBoundaryComponent onError={setErr}>
      {children}
    </ErrorBoundaryComponent>
  );
}

class ErrorBoundaryComponent extends React.Component<
  { children: React.ReactNode; onError?: (e: string) => void },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: unknown) {
    if (this.props.onError) this.props.onError((error as Error)?.message || "Lỗi nội bộ 3D");
  }
  render() {
    if (this.state.hasError) return <WebGLFallback label="Lỗi trong khu vực 3D" />;
    return this.props.children;
  }
}

export default function SolarSystemCanvas({
  onSelectSpace,
  onOpenDetail,
  selectedSpace,
  speed,
}: SolarSystemCanvasProps) {
  const planetsList = useMemo(() => {
    return Object.values(SPACES_DATA).filter((s) => s.id !== "sun");
  }, []);

  const [glError, setGlError] = React.useState<string | null>(null);
  if (glError) {
    return <WebGLFallback label={glError} />;
  }

  return (
    <div className="w-full h-full relative bg-radial from-slate-950 via-slate-900 to-black">
      <SceneErrorBoundary>
        <Canvas
          camera={{ position: [0, 35, 48], fov: 45, near: 0.1, far: 1000 }}
          className="w-full h-full"
          fallback={<WebGLFallback label="WebGL chưa khả dụng" />}
          gl={{ antialias: true, failIfMajorPerformanceCaveat: false }}
          onCreated={() => {
            /* noop */
          }}
        >
          <ambientLight intensity={0.4} />
          <CosmicBackground />

          {/* Orbit Lines for all planets */}
          {planetsList.map((p) => (
            <OrbitLine key={`orbit-${p.id}`} distance={p.planet3d.distance} />
          ))}

          {/* Center Sun */}
          <SunMesh
            onSelect={() => onSelectSpace(SPACES_DATA["sun"])}
            onOpenDetail={() => onOpenDetail?.(SPACES_DATA["sun"])}
          />

          {/* Planets */}
          {planetsList.map((space) => (
            <Planet
              key={space.id}
              space={space}
              onSelect={onSelectSpace}
              onOpenDetail={onOpenDetail}
              isSelected={selectedSpace?.id === space.id}
              simulationSpeed={speed}
            />
          ))}

          <OrbitControls
            enablePan={true}
            enableZoom={true}
            maxDistance={120}
            minDistance={10}
            maxPolarAngle={Math.PI / 2 + 0.1}
          />
        </Canvas>
      </SceneErrorBoundary>
    </div>
  );
}
