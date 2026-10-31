"use client";

import React, { useState, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { Maximize2, Minimize2, Sparkles } from "lucide-react";

interface Real3DMoonPreviewProps {
  moonAngle: number; // 0 to 360 degrees
  isLunarEclipse?: boolean;
}

// Real 3D Moon Sphere with realistic Earth's shadow and solar illumination
function RealMoonMesh({
  moonAngle,
  isLunarEclipse,
  scale = 1.0,
}: {
  moonAngle: number;
  isLunarEclipse?: boolean;
  scale?: number;
}) {
  const moonTexture = useMemo(() => {
    return new THREE.TextureLoader().load("/textures/planets/moonmap1k.jpg");
  }, []);

  const norm = ((moonAngle % 360) + 360) % 360;
  const rad = (norm * Math.PI) / 180;
  const lightX = Math.sin(rad) * 12;
  const lightZ = Math.cos(rad) * 12;

  // Earth shadow coverage fraction: 0 to 1
  const shadowCover = Math.max(0, Math.min(1, Math.abs(norm - 180) / 180));

  return (
    <group scale={scale}>
      <ambientLight intensity={0.06} />

      {/* Main Sunlight shining on the 3D Moon sphere */}
      <directionalLight
        position={[lightX, 0.4, lightZ]}
        intensity={2.7}
        color={isLunarEclipse ? "#ef4444" : "#ffffff"}
      />

      {/* Soft cosmic fill */}
      <directionalLight position={[-lightX, -0.4, -lightZ]} intensity={0.04} color="#38bdf8" />

      {/* The Real 3D Moon Sphere */}
      <mesh rotation={[0, 0, 0]}>
        <sphereGeometry args={[1.4, 64, 64]} />
        <meshStandardMaterial
          map={moonTexture}
          color={isLunarEclipse ? "#dc2626" : "#ffffff"}
          roughness={0.78}
          metalness={0.05}
        />
      </mesh>

      {/* Earth's Curved Shadow overlay casting onto the Moon (Bóng của Trái Đất che khuyết) */}
      {shadowCover < 0.96 && (
        <mesh
          position={[Math.sin(rad) * 0.45, 0, 0.05]}
          rotation={[0, 0, 0]}
        >
          <sphereGeometry args={[1.42, 32, 32, 0, Math.PI * 2, 0, Math.PI]} />
          <meshBasicMaterial
            color={isLunarEclipse ? "#7f1d1d" : "#020617"}
            transparent
            opacity={0.88 * (1 - shadowCover)}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}

export function getPhaseStatus(angle: number): {
  phaseName: string;
  shadowPercent: number;
  icon: string;
  desc: string;
} {
  const norm = ((angle % 360) + 360) % 360;
  const shadowPercent = Math.round((1 - ((1 + Math.cos((norm * Math.PI) / 180)) / 2)) * 100);

  if (shadowPercent <= 5) {
    return {
      phaseName: "Trăng Tròn (Rằm)",
      shadowPercent: 0,
      icon: "🌕",
      desc: "Mặt Trăng sáng trọn vẹn (ngoài bóng Trái Đất)",
    };
  }
  if (shadowPercent >= 95) {
    return {
      phaseName: "Trăng Non (Sóc / Tối)",
      shadowPercent: 100,
      icon: "🌑",
      desc: "Mặt Trăng chìm hoàn toàn trong bóng tối",
    };
  }
  if (norm < 180) {
    return {
      phaseName: shadowPercent > 45 && shadowPercent < 55 ? "Trăng Bán Nguyệt (Thượng huyền)" : "Trăng Khuyết Đầu Tháng",
      shadowPercent,
      icon: shadowPercent > 50 ? "🌒" : "🌓",
      desc: `Bóng Trái Đất che khuyết ${shadowPercent}% Mặt Trăng`,
    };
  } else {
    return {
      phaseName: shadowPercent > 45 && shadowPercent < 55 ? "Trăng Bán Nguyệt (Hạ huyền)" : "Trăng Khuyết Cuối Tháng",
      shadowPercent,
      icon: shadowPercent > 50 ? "🌘" : "🌗",
      desc: `Bóng Trái Đất che khuyết ${shadowPercent}% Mặt Trăng`,
    };
  }
}

export default function Real3DMoonPreview({
  moonAngle,
  isLunarEclipse,
}: Real3DMoonPreviewProps) {
  // State toggling the 3D Moon viewport frame between normal and enlarged size
  const [isEnlarged, setIsEnlarged] = useState<boolean>(false);
  const status = getPhaseStatus(moonAngle);

  return (
    <div className="flex flex-col items-end pointer-events-auto select-none animate-fade-in">
      {/* 3D Real Moon Viewport Frame (Resizable between compact and enlarged) */}
      <div
        className={`relative rounded-3xl bg-slate-950/92 backdrop-blur-2xl border-2 border-cyan-500/60 shadow-2xl overflow-hidden flex flex-col items-center justify-between p-2 shadow-cyan-500/20 transition-all duration-300 ease-out ${
          isEnlarged
            ? "w-64 h-64 xs:w-72 xs:h-72 sm:w-80 sm:h-80 md:w-96 md:h-96"
            : "w-32 h-32 xs:w-36 xs:h-36 sm:w-40 sm:h-40"
        }`}
      >
        {/* Top Header Tag with Enlarge / Shrink Frame Button */}
        <div className="w-full flex items-center justify-between px-1 z-10">
          <span className="text-[10px] xs:text-xs font-black text-cyan-300 uppercase tracking-wider flex items-center gap-1.5 pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            {isEnlarged ? "Khung Mặt Trăng Phóng To" : "Mặt Trăng 3D"}
          </span>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-bold text-amber-300 bg-slate-900/90 px-1.5 py-0.5 rounded border border-slate-700 pointer-events-none">
              {100 - status.shadowPercent}% sáng
            </span>

            {/* Toggle Button: Enlarge / Minimize Frame */}
            <button
              onClick={() => setIsEnlarged((prev) => !prev)}
              className="min-h-[28px] min-w-[28px] p-1.5 rounded-xl bg-cyan-500 text-stone-950 font-bold hover:scale-105 active:scale-95 transition shadow flex items-center justify-center cursor-pointer"
              title={isEnlarged ? "Thu nhỏ khung Mặt Trăng 3D" : "Phóng to khung hiển thị Mặt Trăng 3D để xem rõ hơn"}
            >
              {isEnlarged ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
          </div>
        </div>

        {/* Real 3D Moon Canvas */}
        <div className="absolute inset-0 z-0">
          <Canvas
            camera={{ position: [0, 0, 3.4], fov: 42 }}
            gl={{ antialias: true, alpha: true }}
          >
            {isEnlarged && (
              <OrbitControls enableZoom={true} enablePan={false} minDistance={2.2} maxDistance={5.5} />
            )}
            <RealMoonMesh
              moonAngle={moonAngle}
              isLunarEclipse={isLunarEclipse}
              scale={isEnlarged ? 1.15 : 1.0}
            />
          </Canvas>

          {/* Interactive hint when enlarged */}
          {isEnlarged && (
            <div className="absolute top-9 left-2 bg-slate-900/80 px-2 py-0.5 rounded-full border border-slate-700 text-[9px] text-slate-300 pointer-events-none flex items-center gap-1">
              <Sparkles size={11} className="text-cyan-400" />
              <span>Vuốt/cuộn để xoay và zoom 3D</span>
            </div>
          )}
        </div>

        {/* Bottom Label Tag */}
        <div className="w-full z-10 pb-0.5 pointer-events-none text-center">
          <div className="px-2.5 py-1 rounded-xl bg-slate-900/95 backdrop-blur-md border border-cyan-500/50 inline-flex items-center gap-1.5 text-xs font-bold text-white shadow-xl max-w-[95%] truncate">
            <span className="text-sm">{status.icon}</span>
            <span className="truncate">{status.phaseName}</span>
          </div>
        </div>
      </div>

      {/* Explanatory subtitle below the 3D lens */}
      <div className={`mt-1 px-2.5 py-1 rounded-full bg-slate-950/95 border border-slate-700/80 text-[10px] text-slate-300 flex items-center gap-1.5 shadow pointer-events-none transition-all ${
        isEnlarged ? "max-w-[320px]" : "max-w-[200px]"
      } truncate`}>
        <span className="text-amber-400">🌑</span>
        <span className="truncate">{status.desc}</span>
      </div>
    </div>
  );
}
