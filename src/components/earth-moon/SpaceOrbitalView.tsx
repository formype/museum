"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import Real3DMoonPreview from "./Real3DMoonPreview";

export type SpaceSimulationMode = "normal" | "solar_eclipse" | "lunar_eclipse";

interface SpaceOrbitalViewProps {
  mode: SpaceSimulationMode;
  moonAngle: number; // in degrees (0 to 360)
  autoRotate: boolean;
  onSelectPreset: (preset: SpaceSimulationMode) => void;
  onSelectAngle?: (angle: number) => void;
  showLabels: boolean;
}

// 3D Celestial System: Sun, Earth, Moon, Shadows
function OrbitalScene({
  mode,
  moonAngle,
  autoRotate,
  showLabels,
}: {
  mode: SpaceSimulationMode;
  moonAngle: number;
  autoRotate: boolean;
  showLabels: boolean;
}) {
  const earthRef = useRef<THREE.Mesh>(null);
  const moonRef = useRef<THREE.Mesh>(null);
  const rotationRef = useRef<number>(0);

  // Textures
  const earthTexture = useMemo(() => {
    return new THREE.TextureLoader().load("/textures/planets/earthmap1k.jpg");
  }, []);

  const moonTexture = useMemo(() => {
    return new THREE.TextureLoader().load("/textures/planets/moonmap1k.jpg");
  }, []);

  const sunTexture = useMemo(() => {
    return new THREE.TextureLoader().load("/textures/planets/sunmap.jpg");
  }, []);

  // Earth distance from origin = (0, 0, 0)
  // Moon orbit radius = 4.5 units
  const moonOrbitRadius = 4.5;
  const rad = (moonAngle * Math.PI) / 180;
  const moonX = Math.cos(rad) * moonOrbitRadius;
  const moonZ = Math.sin(rad) * moonOrbitRadius;

  useFrame((_, delta) => {
    if (autoRotate) {
      rotationRef.current += delta * 0.4;
      if (earthRef.current) {
        earthRef.current.rotation.y += delta * 0.5;
      }
      if (moonRef.current) {
        moonRef.current.rotation.y += delta * 0.2;
      }
    }
  });

  // Check if Lunar Eclipse is happening (Moon inside Earth shadow at ~0° or mode active)
  const isLunarEclipse = mode === "lunar_eclipse" || (Math.abs(moonAngle - 0) < 14 || Math.abs(moonAngle - 360) < 14);
  const isSolarEclipse = mode === "solar_eclipse" || Math.abs(moonAngle - 180) < 14;

  // Axial tilt of Earth: 23.5 degrees = 0.4101 rad
  const axialTilt = 0.4101;

  return (
    <>
      <ambientLight intensity={0.06} />

      {/* Sun Light Source (Positioned at X = -24) */}
      <directionalLight
        position={[-24, 0, 0]}
        intensity={3.2}
        color="#fffcf0"
        castShadow
      />
      {/* Subtle cosmic bounce light */}
      <directionalLight position={[15, 8, 10]} intensity={0.08} color="#38bdf8" />

      {/* ================================================================= */}
      {/* 1. MẶT TRỜI (SUN) at X = -18                                     */}
      {/* ================================================================= */}
      <group position={[-18, 0, 0]}>
        <mesh>
          <sphereGeometry args={[3.2, 32, 32]} />
          <meshBasicMaterial map={sunTexture} color="#ffaa22" />
        </mesh>
        {/* Sun corona glow */}
        <mesh>
          <sphereGeometry args={[3.6, 32, 32]} />
          <meshBasicMaterial color="#ff7700" transparent opacity={0.25} side={THREE.BackSide} />
        </mesh>
        <pointLight intensity={3.5} distance={60} decay={1.5} color="#ffaa00" />

        {showLabels && (
          <Html position={[0, 4.2, 0]} center distanceFactor={20}>
            <div className="bg-amber-500/90 text-stone-950 font-black text-xs px-2.5 py-1 rounded-full border border-amber-300 shadow-lg pointer-events-none whitespace-nowrap">
              ☀️ MẶT TRỜI (Nguồn Sáng)
            </div>
          </Html>
        )}
      </group>

      {/* ================================================================= */}
      {/* 2. CÁC TIA SÁNG MẶT TRỜI (PARALLEL SOLAR RAYS)                   */}
      {/* ================================================================= */}
      <group>
        {[-2.5, -1.2, 0, 1.2, 2.5].map((z, idx) => (
          <line key={`ray-${idx}`}>
            <bufferGeometry
              attach="geometry"
              onUpdate={(self) => {
                const points = [
                  new THREE.Vector3(-14, 0, z),
                  new THREE.Vector3(z === 0 ? -1.8 : 8, 0, z),
                ];
                self.setFromPoints(points);
              }}
            />
            <lineBasicMaterial
              attach="material"
              color="#fef08a"
              transparent
              opacity={0.35}
            />
          </line>
        ))}
      </group>

      {/* ================================================================= */}
      {/* 3. TRÁI ĐẤT (EARTH) at Origin (0, 0, 0)                          */}
      {/* ================================================================= */}
      <group rotation={[axialTilt, 0, 0]}>
        {/* Main Earth Globe */}
        <mesh ref={earthRef} castShadow receiveShadow>
          <sphereGeometry args={[1.6, 64, 64]} />
          <meshStandardMaterial
            map={earthTexture}
            roughness={0.65}
            metalness={0.1}
          />
        </mesh>

        {/* Earth Rotational Axis Pole */}
        <line>
          <bufferGeometry
            attach="geometry"
            onUpdate={(self) => {
              const points = [
                new THREE.Vector3(0, -2.6, 0),
                new THREE.Vector3(0, 2.6, 0),
              ];
              self.setFromPoints(points);
            }}
          />
          <lineBasicMaterial attach="material" color="#38bdf8" transparent opacity={0.6} />
        </line>

        {showLabels && (
          <>
            <Html position={[0, 2.8, 0]} center distanceFactor={18}>
              <div className="bg-cyan-950/90 text-cyan-300 border border-cyan-400/50 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-md pointer-events-none">
                Cực Bắc (Nghiêng 23.5°)
              </div>
            </Html>
            <Html position={[0, -2.8, 0]} center distanceFactor={18}>
              <div className="bg-cyan-950/90 text-cyan-300 border border-cyan-400/50 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-md pointer-events-none">
                Cực Nam
              </div>
            </Html>
          </>
        )}
      </group>

      {/* Labels for Earth Day / Night regions */}
      {showLabels && (
        <>
          {/* Day Side: -X */}
          <Html position={[-1.7, 1.8, 0]} center distanceFactor={18}>
            <div className="bg-amber-400 text-stone-950 font-bold text-[10px] px-2 py-0.5 rounded-md border border-amber-200 shadow-md whitespace-nowrap pointer-events-none">
              ☀️ Ban Ngày (Được chiếu sáng)
            </div>
          </Html>
          {/* Night Side: +X */}
          <Html position={[1.7, 1.8, 0]} center distanceFactor={18}>
            <div className="bg-slate-900/95 text-blue-300 font-bold text-[10px] px-2 py-0.5 rounded-md border border-blue-500/40 shadow-md whitespace-nowrap pointer-events-none">
              🌙 Ban Đêm (Vùng tối)
            </div>
          </Html>
          {/* Terminator Line Marker */}
          <Html position={[0, -2.0, 1.6]} center distanceFactor={18}>
            <div className="bg-slate-800/90 text-slate-200 text-[9px] font-mono px-2 py-0.5 rounded border border-slate-600 whitespace-nowrap pointer-events-none">
              Ranh giới Ngày - Đêm
            </div>
          </Html>
        </>
      )}

      {/* Earth Orbit Line for Moon */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[moonOrbitRadius - 0.03, moonOrbitRadius + 0.03, 64]} />
        <meshBasicMaterial color="#64748b" transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>

      {/* ================================================================= */}
      {/* 4. NÓN BÓNG TỐI CỦA TRÁI ĐẤT (BÓNG TRÁI ĐẤT KÉO DÀI VÀO VŨ TRỤ)  */}
      {/* ================================================================= */}
      <group position={[4.5, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <mesh>
          <coneGeometry args={[1.6, 9.0, 32, 1, true]} />
          <meshBasicMaterial
            color={isLunarEclipse ? "#991b1b" : "#020617"}
            transparent
            opacity={isLunarEclipse ? 0.5 : 0.3}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
        {/* Ring boundary marker in 3D space */}
        <mesh position={[0, -2.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.2, 1.25, 32]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.35} side={THREE.DoubleSide} />
        </mesh>
        {showLabels && (
          <Html position={[0, 4.0, 0]} center distanceFactor={18}>
            <div className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] shadow-lg pointer-events-none whitespace-nowrap border ${
              isLunarEclipse
                ? "bg-red-950 text-red-200 border-red-500 animate-pulse"
                : "bg-slate-950/90 text-cyan-200 border-cyan-500/50"
            }`}>
              🌑 Bóng Tối Trái Đất (Bóng Trái Đất Đổ Vào Không Gian)
            </div>
          </Html>
        )}
      </group>

      {/* ================================================================= */}
      {/* 5. MẶT TRĂNG (MOON) & NÓN BÓNG TỐI NHẬT THỰC                     */}
      {/* ================================================================= */}
      <group position={[moonX, 0, moonZ]}>
        {/* Moon Sphere */}
        <mesh ref={moonRef} castShadow receiveShadow>
          <sphereGeometry args={[0.55, 32, 32]} />
          <meshStandardMaterial
            map={moonTexture}
            color={isLunarEclipse ? "#dc2626" : "#ffffff"}
            roughness={0.8}
            metalness={0.05}
          />
        </mesh>

        {showLabels && (
          <Html position={[0, 0.9, 0]} center distanceFactor={16}>
            <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shadow-lg pointer-events-none whitespace-nowrap ${
              isLunarEclipse
                ? "bg-red-900/90 text-red-200 border-red-400 animate-bounce"
                : isSolarEclipse
                ? "bg-amber-950/90 text-amber-200 border-amber-400 animate-pulse"
                : "bg-slate-900/90 text-slate-200 border-slate-700"
            }`}>
              {isLunarEclipse ? "🔴 Mặt Trăng Máu (Nguyệt thực)" : isSolarEclipse ? "🌑 Mặt Trăng Che Khuất MT" : "🌕 Mặt Trăng 3D"}
            </div>
          </Html>
        )}

        {/* Solar Eclipse Shadow Cone: Moon casts shadow onto Earth */}
        {(mode === "solar_eclipse" || isSolarEclipse) && (
          <group position={[1.5, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <mesh>
              <coneGeometry args={[0.55, 3.2, 32, 1, true]} />
              <meshBasicMaterial
                color="#1e293b"
                transparent
                opacity={0.45}
                side={THREE.DoubleSide}
                depthWrite={false}
              />
            </mesh>
            {showLabels && (
              <Html position={[0, 1.4, 0]} center distanceFactor={16}>
                <div className="bg-amber-950/95 text-amber-200 border border-amber-500/70 text-[9px] font-bold px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap">
                  Bóng tối Mặt Trăng đổ lên Trái Đất
                </div>
              </Html>
            )}
          </group>
        )}
      </group>
    </>
  );
}

export default function SpaceOrbitalView({
  mode,
  moonAngle,
  autoRotate,
  onSelectPreset,
  showLabels,
}: SpaceOrbitalViewProps) {
  const [isExpanded, setIsExpanded] = React.useState<boolean>(false);
  const isLunarEclipse = mode === "lunar_eclipse" || (Math.abs(moonAngle - 0) < 14 || Math.abs(moonAngle - 360) < 14);

  return (
    <div className="relative w-full h-full bg-slate-950 select-none overflow-hidden">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 9.5, 12], fov: 42 }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          target={[0, 0, 0]}
          minDistance={5}
          maxDistance={35}
          maxPolarAngle={Math.PI / 1.85}
        />
        <OrbitalScene
          mode={mode}
          moonAngle={moonAngle}
          autoRotate={autoRotate}
          showLabels={showLabels}
        />
      </Canvas>

      {/* Real 3D Moon Lens Preview (Top Right - Zoomed & Enlarged) */}
      <div className="absolute top-2 right-2 z-20 pointer-events-auto">
        <Real3DMoonPreview moonAngle={moonAngle} isLunarEclipse={isLunarEclipse} />
      </div>

      {/* Information Overlay Panel at Bottom Left */}
      <div className="absolute bottom-2 left-2 right-2 sm:right-auto sm:max-w-md p-2.5 sm:p-3 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl text-white text-xs space-y-1.5 sm:space-y-2 pointer-events-auto z-10">
        <div className="flex items-center justify-between pb-1 border-b border-slate-800">
          <span className="font-bold text-cyan-300 flex items-center gap-1.5 text-[11px] sm:text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            Không Gian 3D (Vũ Trụ)
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-400">
              Góc Quỹ Đạo: {Math.round(moonAngle)}°
            </span>
            <button
              onClick={() => setIsExpanded((prev) => !prev)}
              className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold border border-slate-700"
            >
              {isExpanded ? "Thu gọn ▲" : "Chi tiết ▼"}
            </button>
          </div>
        </div>

        {/* Quick Simulation Presets */}
        <div className="flex items-center gap-1 pt-0.5">
          <button
            onClick={() => onSelectPreset("normal")}
            className={`flex-1 min-h-[34px] py-1 px-1 rounded-xl text-[10px] sm:text-[11px] font-bold border transition ${
              mode === "normal"
                ? "bg-cyan-500/30 text-cyan-300 border-cyan-400"
                : "bg-slate-800/70 text-slate-400 border-slate-700 hover:text-white"
            }`}
          >
            Ngày & Đêm
          </button>
          <button
            onClick={() => onSelectPreset("solar_eclipse")}
            className={`flex-1 min-h-[34px] py-1 px-1 rounded-xl text-[10px] sm:text-[11px] font-bold border transition ${
              mode === "solar_eclipse"
                ? "bg-amber-500/30 text-amber-300 border-amber-400"
                : "bg-slate-800/70 text-slate-400 border-slate-700 hover:text-white"
            }`}
          >
            Nhật Thực
          </button>
          <button
            onClick={() => onSelectPreset("lunar_eclipse")}
            className={`flex-1 min-h-[34px] py-1 px-1 rounded-xl text-[10px] sm:text-[11px] font-bold border transition ${
              mode === "lunar_eclipse"
                ? "bg-red-500/30 text-red-300 border-red-400"
                : "bg-slate-800/70 text-slate-400 border-slate-700 hover:text-white"
            }`}
          >
            Nguyệt Thực
          </button>
        </div>

        {/* Expandable Explanation Details */}
        {(isExpanded || typeof window === "undefined") && (
          <div className="text-slate-300 text-[10px] sm:text-[11px] leading-relaxed pt-1 border-t border-slate-800/80 animate-fade-in">
            {mode === "solar_eclipse" ? (
              <p className="text-amber-200 font-medium">
                🌑 <strong>Nhật Thực:</strong> Mặt Trăng nằm giữa Mặt Trời và Trái Đất (thẳng hàng). Nón bóng tối Mặt Trăng đổ lên Trái Đất, che khuất ánh sáng Mặt Trời.
              </p>
            ) : mode === "lunar_eclipse" ? (
              <p className="text-red-200 font-medium">
                🔴 <strong>Nguyệt Thực:</strong> Trái Đất nằm giữa Mặt Trời và Mặt Trăng (thẳng hàng). Nón bóng tối Trái Đất trùm kín Mặt Trăng, khiến Mặt Trăng nhuộm màu đỏ đồng do ánh sáng đỏ tán xạ qua khí quyển Trái Đất.
              </p>
            ) : (
              <p>
                🌍 <strong>Bóng Trái Đất & Trăng Khuyết:</strong> Nón bóng tối của Trái Đất luôn kéo dài về phía sau. Khi Mặt Trăng chuyển động trên quỹ đạo, sự che khuất của bóng Trái Đất tạo nên các pha trăng tròn và trăng khuyết đúng thực tế thiên văn!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
