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

// Planet textures mapping
const PLANET_TEXTURES: Record<string, string> = {
  sun: "/textures/planets/sunmap.jpg",
  mercury: "/textures/planets/mercurymap.jpg",
  venus: "/textures/planets/venusmap.jpg",
  earth: "/textures/planets/earthmap1k.jpg",
  moon: "/textures/planets/moonmap1k.jpg",
  mars: "/textures/planets/marsmap1k.jpg",
  jupiter: "/textures/planets/jupitermap.jpg",
  saturn: "/textures/planets/saturnmap.jpg",
  uranus: "/textures/planets/uranusmap.jpg",
  neptune: "/textures/planets/neptunemap.jpg",
};

// Glowing Sun component
function SunMesh({ onSelect, onOpenDetail }: { onSelect: () => void; onOpenDetail?: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const lastClickRef = useRef<number>(0);
  const sunTexture = useMemo(() => new THREE.TextureLoader().load("/textures/planets/sunmap.jpg"), []);

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
        <meshBasicMaterial map={sunTexture} />
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

      {/* Sun Light Source: realistic attenuation from solar center */}
      <pointLight intensity={4.5} distance={150} decay={0.8} color="#fffaf0" />
      {/* Soft ambient cosmic background light */}
      <ambientLight intensity={0.12} />
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
  const moonGroupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const lastClickRef = useRef<number>(0);

  const isEarth = space.id === "earth";
  const isUranus = space.id === "uranus";

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
    const elapsed = clock.getElapsedTime();
    if (groupRef.current && space.planet3d.distance > 0) {
      const t = elapsed * space.planet3d.speed * simulationSpeed + initialAngle;
      groupRef.current.position.x = Math.cos(t) * space.planet3d.distance;
      groupRef.current.position.z = Math.sin(t) * space.planet3d.distance;
    }

    // Planetary rotation around its own axis
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.015;
    }

    // Moon orbiting around Earth in real-time
    if (isEarth && moonGroupRef.current) {
      const moonSpeed = elapsed * 0.08 * simulationSpeed;
      moonGroupRef.current.position.x = Math.cos(moonSpeed) * 2.3;
      moonGroupRef.current.position.z = Math.sin(moonSpeed) * 2.3;
    }
  });

  const { size, color, ring, ringColor, ringInnerRadius, ringOuterRadius } = space.planet3d;
  const texturePath = PLANET_TEXTURES[space.id] || PLANET_TEXTURES[space.planet3d.textureType];
  const planetTexture = useMemo(() => {
    if (!texturePath) return null;
    return new THREE.TextureLoader().load(texturePath);
  }, [texturePath]);

  const saturnRingTexture = useMemo(() => {
    if (!ring) return null;
    return new THREE.TextureLoader().load("/textures/planets/saturnringcolor.jpg");
  }, [ring]);

  const moonTexture = useMemo(() => {
    if (!isEarth) return null;
    return new THREE.TextureLoader().load("/textures/planets/moonmap1k.jpg");
  }, [isEarth]);

  // Scientific axial tilt: Earth is 23.5 degrees (0.41 rad), Uranus is 97.8 degrees (1.71 rad)
  const axialTilt = isEarth ? 0.4101 : (isUranus ? 1.706 : 0.05);

  return (
    <group ref={groupRef}>
      {/* Tilted System Wrapper to represent true geographical axis */}
      <group rotation={[axialTilt, 0, isEarth ? 0.08 : 0]}>
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
          <sphereGeometry args={[size, 48, 48]} />
          <meshStandardMaterial
            map={planetTexture || undefined}
            color={planetTexture ? "#ffffff" : color}
            roughness={0.7}
            metalness={0.1}
            emissive={isSelected || hovered ? color : "#000000"}
            emissiveIntensity={hovered ? 0.35 : (isSelected ? 0.2 : 0)}
          />
        </mesh>

        {/* Earth's Rotational Axis Indicator */}
        {isEarth && (
          <line>
            <bufferGeometry
              attach="geometry"
              onUpdate={(self) => {
                const points = [
                  new THREE.Vector3(0, -size * 1.6, 0),
                  new THREE.Vector3(0, size * 1.6, 0),
                ];
                self.setFromPoints(points);
              }}
            />
            <lineBasicMaterial attach="material" color="#38bdf8" transparent opacity={0.6} />
          </line>
        )}

        {/* Saturn Rings */}
        {ring && (
          <mesh rotation={[-Math.PI / 2.3, 0, 0]}>
            <ringGeometry args={[ringInnerRadius || size * 1.4, ringOuterRadius || size * 2.3, 64]} />
            <meshStandardMaterial
              map={saturnRingTexture || undefined}
              color={saturnRingTexture ? "#ffffff" : (ringColor || "#fde047")}
              side={THREE.DoubleSide}
              transparent
              opacity={0.85}
              roughness={0.4}
            />
          </mesh>
        )}
      </group>

      {/* Real-time Natural Satellite: Moon Orbiting Earth */}
      {isEarth && (
        <>
          {/* Moon Orbit Ring around Earth */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[2.28, 2.32, 48]} />
            <meshBasicMaterial color="#94a3b8" side={THREE.DoubleSide} transparent opacity={0.2} />
          </mesh>

          {/* Moon Celestial Body */}
          <group ref={moonGroupRef}>
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                spaceAudio.playWarpSound();
                if (SPACES_DATA["moon"]) {
                  onSelect(SPACES_DATA["moon"]);
                }
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                spaceAudio.playWarpSound();
                if (SPACES_DATA["moon"]) {
                  onOpenDetail?.(SPACES_DATA["moon"]);
                }
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                document.body.style.cursor = "pointer";
              }}
              onPointerOut={() => {
                document.body.style.cursor = "default";
              }}
            >
              <sphereGeometry args={[0.38, 24, 24]} />
              <meshStandardMaterial
                map={moonTexture || undefined}
                color={moonTexture ? "#ffffff" : "#cbd5e1"}
                roughness={0.8}
              />
            </mesh>
            <Html position={[0, 0.65, 0]} center distanceFactor={20}>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  spaceAudio.playWarpSound();
                  if (SPACES_DATA["moon"]) {
                    onSelect(SPACES_DATA["moon"]);
                  }
                }}
                className="cursor-pointer text-[9px] font-bold text-slate-300 bg-slate-950/80 hover:bg-slate-800 px-1.5 py-0.5 rounded-full border border-slate-700 pointer-events-auto whitespace-nowrap transition"
              >
                🌕 Mặt Trăng
              </div>
            </Html>
          </group>
        </>
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
    // Only 8 primary planets orbit the Sun directly; Moon orbits Earth
    return Object.values(SPACES_DATA).filter((s) => s.id !== "sun" && s.id !== "moon");
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
