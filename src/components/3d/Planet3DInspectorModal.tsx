"use client";

import React, { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { SpaceData } from "@/data/spaces";
import { spaceAudio } from "@/lib/audio-synth";
import {
  X,
  Eye,
  Volume2,
  VolumeX,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Play,
  Pause,
  Globe,
  Thermometer,
  Clock,
  Compass,
  Sparkles,
  Info,
  Sun,
} from "lucide-react";

interface Planet3DInspectorModalProps {
  planet: SpaceData | null;
  onClose: () => void;
  onEnter360?: (planetId: string) => void;
}

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

// 3D Single Planet Sphere inside Canvas
function InteractivePlanetMesh({
  planet,
  autoRotate,
  scale,
}: {
  planet: SpaceData;
  autoRotate: boolean;
  scale: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const textureUrl = PLANET_TEXTURES[planet.id] || PLANET_TEXTURES[planet.planet3d.textureType];
  const texture = useMemo(() => {
    if (!textureUrl) return null;
    return new THREE.TextureLoader().load(textureUrl);
  }, [textureUrl]);

  const saturnRingTexture = useMemo(() => {
    if (!planet.planet3d.ring) return null;
    return new THREE.TextureLoader().load("/textures/planets/saturnringcolor.jpg");
  }, [planet.planet3d.ring]);

  useFrame((_, delta) => {
    if (autoRotate && meshRef.current) {
      meshRef.current.rotation.y += delta * 0.25;
    }
  });

  const isSun = planet.id === "sun";
  const isEarth = planet.id === "earth";
  const isUranus = planet.id === "uranus";

  // Scientific axial tilt: Earth 23.5 degrees (0.4101 rad), Uranus 97.8 degrees (1.706 rad)
  const axialTilt = isEarth ? 0.4101 : (isUranus ? 1.706 : 0);

  return (
    <group scale={scale}>
      <group rotation={[axialTilt, 0, isEarth ? 0.08 : 0]}>
        {/* Main Celestial Sphere */}
        <mesh ref={meshRef}>
          <sphereGeometry args={[2.0, 64, 64]} />
          {isSun ? (
            <meshBasicMaterial map={texture || undefined} color="#ff9900" />
          ) : (
            <meshStandardMaterial
              map={texture || undefined}
              color={texture ? "#ffffff" : planet.planet3d.color}
              roughness={0.7}
              metalness={0.1}
            />
          )}
        </mesh>

        {/* Earth Rotational Axis Pole Visualizer */}
        {isEarth && (
          <>
            <line>
              <bufferGeometry
                attach="geometry"
                onUpdate={(self) => {
                  const points = [
                    new THREE.Vector3(0, -3.2, 0),
                    new THREE.Vector3(0, 3.2, 0),
                  ];
                  self.setFromPoints(points);
                }}
              />
              <lineBasicMaterial attach="material" color="#38bdf8" transparent opacity={0.7} />
            </line>
            {/* North and South Pole Markers */}
            <Html position={[0, 3.3, 0]} center distanceFactor={15}>
              <span className="text-[9px] font-bold text-cyan-300 bg-slate-950/80 px-1.5 py-0.5 rounded-full border border-cyan-500/40 pointer-events-none whitespace-nowrap">
                Cực Bắc (Nghiêng 23.5°)
              </span>
            </Html>
            <Html position={[0, -3.3, 0]} center distanceFactor={15}>
              <span className="text-[9px] font-bold text-cyan-300 bg-slate-950/80 px-1.5 py-0.5 rounded-full border border-cyan-500/40 pointer-events-none whitespace-nowrap">
                Cực Nam
              </span>
            </Html>
          </>
        )}

        {/* Saturn Rings */}
        {planet.planet3d.ring && (
          <mesh ref={ringRef} rotation={[-Math.PI / 2.3, 0, 0]}>
            <ringGeometry args={[2.5, 4.4, 64]} />
            <meshStandardMaterial
              map={saturnRingTexture || undefined}
              color={saturnRingTexture ? "#ffffff" : "#fde047"}
              side={THREE.DoubleSide}
              transparent
              opacity={0.9}
              roughness={0.4}
            />
          </mesh>
        )}
      </group>

      {/* Sun Corona Glow */}
      {isSun && (
        <mesh>
          <sphereGeometry args={[2.3, 32, 32]} />
          <meshBasicMaterial
            color="#ff5500"
            transparent
            opacity={0.3}
            side={THREE.BackSide}
          />
        </mesh>
      )}
    </group>
  );
}

export default function Planet3DInspectorModal({
  planet,
  onClose,
}: Planet3DInspectorModalProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [dayNightMode, setDayNightMode] = useState<boolean>(true);
  const controlsRef = useRef<any>(null);

  if (!planet) return null;

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.max(0.5, Math.min(2.5, prev + delta)));
  };

  const handleReset = () => {
    setZoomLevel(1);
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      spaceAudio.stopSpeech();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      const textToRead = `${planet.name}. ${planet.tagline}. Khoảng cách từ Trái Đất tới ${planet.name} là ${planet.stats.distanceFromEarth || planet.stats.distanceFromSun}. ${planet.overview}`;
      spaceAudio.speakNarration(textToRead, undefined, () => {
        setIsPlayingAudio(false);
      });
    }
  };

  const handleCloseModal = () => {
    spaceAudio.stopSpeech();
    setIsPlayingAudio(false);
    onClose();
  };

  const isSun = planet.id === "sun";
  const isEarth = planet.id === "earth";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-5xl h-[92vh] sm:h-[86vh] bg-slate-900/95 border border-cyan-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row text-white">
        {/* Close Button Top Right */}
        <button
          onClick={handleCloseModal}
          className="absolute top-3 right-3 z-30 min-h-[40px] min-w-[40px] p-2 rounded-2xl bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 backdrop-blur-md transition shadow-lg flex items-center justify-center"
          title="Đóng (Esc)"
        >
          <X size={18} />
        </button>

        {/* ========================================================================= */}
        {/* LEFT / TOP: INTERACTIVE 3D PLANET VIEWER                                  */}
        {/* ========================================================================= */}
        <div className="relative w-full md:w-1/2 h-[45%] md:h-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800/80 overflow-hidden">
          {/* Header Badge */}
          <div className="absolute top-3 left-3 z-20 flex items-center gap-2 pointer-events-none">
            <div className="px-3 py-1 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-cyan-500/30 text-xs font-semibold text-cyan-300 flex items-center gap-1.5 shadow-md">
              <span className="text-base">{planet.aiContext.avatarEmoji}</span>
              <span>Mô Hình 3D Thực Tế</span>
            </div>
          </div>

          {/* 3D Canvas */}
          <div className="w-full h-full cursor-grab active:cursor-grabbing">
            <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }}>
              {isSun ? (
                <>
                  <ambientLight intensity={1.5} />
                  <pointLight position={[0, 0, 0]} intensity={2.0} color="#ff9900" />
                </>
              ) : dayNightMode ? (
                <>
                  {/* Realistic Sunlight from right (+X): creates crisp Day/Night terminator boundary */}
                  <directionalLight position={[12, 1, 4]} intensity={2.8} color="#fffcf5" />
                  {/* Subtle cosmic starlight on the night side to prevent pitch black */}
                  <ambientLight intensity={0.06} />
                  {/* Earth atmosphere blue scattering rim light */}
                  <directionalLight position={[-10, 0, -5]} intensity={0.12} color="#0284c7" />
                </>
              ) : (
                <>
                  <ambientLight intensity={0.7} />
                  <directionalLight position={[6, 3, 5]} intensity={1.8} color="#ffffff" />
                </>
              )}

              {/* Solar Rays Visualizer on Day/Night mode */}
              {!isSun && dayNightMode && (
                <group position={[4.5, 0, 0]}>
                  <Html position={[0, 2.2, 0]} center distanceFactor={14}>
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/90 text-stone-950 font-extrabold text-[10px] shadow-lg border border-amber-300 pointer-events-none whitespace-nowrap animate-pulse">
                      ☀️ Ánh Sáng Mặt Trời Chiếu Tới
                    </div>
                  </Html>
                </group>
              )}

              <InteractivePlanetMesh
                planet={planet}
                autoRotate={autoRotate}
                scale={zoomLevel}
              />

              <OrbitControls
                ref={controlsRef}
                enablePan={false}
                minDistance={2.5}
                maxDistance={10}
                rotateSpeed={0.8}
                zoomSpeed={1.0}
              />
            </Canvas>
          </div>

          {/* 3D Interactive Floating Toolbar */}
          <div className="absolute bottom-3 inset-x-3 z-20 flex items-center justify-between pointer-events-none gap-2">
            <div className="pointer-events-auto flex items-center gap-1 bg-slate-950/85 backdrop-blur-md p-1 rounded-2xl border border-slate-700/80 shadow-xl text-xs">
              {/* Zoom In */}
              <button
                onClick={() => handleZoom(0.25)}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition"
                title="Phóng to 3D"
              >
                <ZoomIn size={16} />
              </button>

              {/* Zoom Out */}
              <button
                onClick={() => handleZoom(-0.25)}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition"
                title="Thu nhỏ 3D"
              >
                <ZoomOut size={16} />
              </button>

              {/* Reset */}
              <button
                onClick={handleReset}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition"
                title="Đặt lại góc nhìn và zoom"
              >
                <RotateCcw size={16} />
              </button>

              {/* Day/Night Solar Lighting Toggle */}
              {!isSun && (
                <button
                  onClick={() => setDayNightMode((prev) => !prev)}
                  className={`p-2 rounded-xl transition flex items-center gap-1 ${
                    dayNightMode
                      ? "bg-amber-500 text-stone-950 font-bold border border-amber-300"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                  title="Bật/Tắt ánh sáng Mặt Trời phân chia Ngày - Đêm"
                >
                  <Sun size={16} />
                  <span className="hidden sm:inline text-[11px]">Ngày/Đêm</span>
                </button>
              )}

              {/* Auto-rotate Toggle */}
              <button
                onClick={() => setAutoRotate((prev) => !prev)}
                className={`p-2 rounded-xl transition ${
                  autoRotate
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
                title="Bật/Tắt tự động xoay quanh trục"
              >
                {autoRotate ? <Pause size={16} /> : <Play size={16} />}
              </button>
            </div>

            {/* Hint Badge */}
            <div className="pointer-events-none px-2.5 py-1 rounded-xl bg-slate-950/80 text-[10px] text-slate-400 font-mono border border-slate-800">
              Kéo xoay 360° • Zoom: {Math.round(zoomLevel * 100)}%
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT / BOTTOM: COMPREHENSIVE PLANET DETAILS & STATS                      */}
        {/* ========================================================================= */}
        <div className="w-full md:w-1/2 h-[55%] md:h-full p-4 sm:p-6 flex flex-col justify-between overflow-y-auto no-scrollbar space-y-4">
          <div className="space-y-4">
            {/* Title & Category Header */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl sm:text-3xl">{planet.aiContext.avatarEmoji}</span>
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
                    {planet.name}
                  </h1>
                  <p className="text-xs text-cyan-400 font-semibold tracking-wide">
                    {planet.nameEn} • {planet.category.replace("_", " ").toUpperCase()}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-300 font-medium leading-relaxed italic">
                &ldquo;{planet.tagline}&rdquo;
              </p>
            </div>

            {/* PROMINENT EARTH DISTANCE BANNER */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/70 via-cyan-950/60 to-slate-900 border border-cyan-500/40 shadow-lg">
              <div className="flex items-center gap-2 mb-1.5">
                <Globe size={16} className="text-cyan-400 shrink-0 animate-pulse" />
                <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider">
                  Khoảng Cách Từ Trái Đất Tới {planet.name}
                </span>
              </div>
              <div className="flex items-baseline gap-2 pl-6">
                <span className="text-base sm:text-lg font-extrabold text-white drop-shadow-md">
                  {planet.stats.distanceFromEarth || planet.stats.distanceFromSun}
                </span>
              </div>
              <div className="mt-2 pt-2 border-t border-cyan-500/20 flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1">🌍 Trái Đất</span>
                <span className="text-cyan-400 font-mono tracking-widest">━━━━━ 🚀 ━━━━━</span>
                <span className="flex items-center gap-1">{planet.aiContext.avatarEmoji} {planet.name}</span>
              </div>
            </div>

            {/* DAY & NIGHT / SEASONS GEOGRAPHICAL EXPLANATION BOX */}
            {isEarth && (
              <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-amber-300 font-bold uppercase tracking-wide">
                  <Sun size={15} className="text-amber-400 shrink-0" />
                  <span>Quy Luật Ngày & Đêm • Trục Nghiêng 23.5°</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <strong className="text-amber-200 block mb-0.5">☀️ Ban Ngày:</strong>
                    <span className="text-slate-300">Nửa cầu hướng về phía Mặt Trời nhận ánh sáng trực tiếp.</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                    <strong className="text-blue-300 block mb-0.5">🌙 Ban Đêm:</strong>
                    <span className="text-slate-300">Nửa cầu quay lưng lại chìm trong bóng tối của vũ trụ.</span>
                  </div>
                </div>
                <p className="text-[11px] text-amber-100/90 leading-relaxed pt-1 border-t border-amber-500/20">
                  💡 <strong>Góc nghiêng 23°27&apos;:</strong> Giữ không đổi phương trong không gian, làm cho diện tích nhận nhiệt thay đổi tuần hoàn, tạo nên hiện tượng 4 mùa và ngày đêm dài ngắn theo mùa.
                </p>
              </div>
            )}

            {planet.id === "moon" && (
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-cyan-500/30 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-cyan-300 font-bold uppercase tracking-wide">
                  <Globe size={15} className="text-cyan-400 shrink-0" />
                  <span>Các Pha Mặt Trăng & Hiện Tượng Thủy Triều</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Mặt Trăng không tự phát sáng mà phản chiếu ánh sáng Mặt Trời. Khi Mặt Trăng quay quanh Trái Đất, góc nhìn từ Trái Đất tới phần được chiếu sáng thay đổi, sinh ra các pha: Trăng Non, Trăng Khuyết, Trăng Tròn (Rằm).
                </p>
                <div className="p-2 rounded-xl bg-cyan-950/50 border border-cyan-500/20 text-[10px] text-cyan-200 font-mono">
                  ⏱️ Chu kỳ tự quay = Chu kỳ quay quanh Trái Đất (27.3 ngày) ➔ Luôn hướng 1 mặt về Trái Đất (Tidal locking).
                </div>
              </div>
            )}

            {/* DETAILED OVERVIEW DESCRIPTION */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-xs uppercase tracking-wide">
                <Info size={14} />
                <span>Mô Tả Chi Tiết</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-justify">
                {planet.overview}
              </p>
              {planet.keyFeatures && planet.keyFeatures.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Đặc điểm nổi bật:
                  </span>
                  {planet.keyFeatures.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-slate-300 text-[11px]">
                      <Sparkles size={12} className="text-amber-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SCIENTIFIC STATS DASHBOARD GRID */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                Thông Số Thiên Văn Chi Tiết:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* Distance From Sun */}
                <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex flex-col">
                  <span className="text-[10px] text-slate-400">Khoảng cách tới Mặt Trời</span>
                  <span className="font-semibold text-white mt-0.5">{planet.stats.distanceFromSun}</span>
                </div>

                {/* Surface Temperature */}
                <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex flex-col">
                  <span className="text-[10px] text-slate-400">Nhiệt độ bề mặt</span>
                  <span className="font-semibold text-amber-300 mt-0.5">{planet.stats.temperature}</span>
                </div>

                {/* Day Length */}
                <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex flex-col">
                  <span className="text-[10px] text-slate-400">Chu kỳ tự quay (Ngày)</span>
                  <span className="font-semibold text-white mt-0.5">{planet.stats.dayLength}</span>
                </div>

                {/* Orbital Year */}
                <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex flex-col">
                  <span className="text-[10px] text-slate-400">Chu kỳ quỹ đạo (Năm)</span>
                  <span className="font-semibold text-white mt-0.5">{planet.stats.yearLength}</span>
                </div>

                {/* Diameter */}
                <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex flex-col">
                  <span className="text-[10px] text-slate-400">Đường kính</span>
                  <span className="font-semibold text-white mt-0.5">{planet.stats.diameter}</span>
                </div>

                {/* Moons */}
                <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex flex-col">
                  <span className="text-[10px] text-slate-400">Số lượng vệ tinh</span>
                  <span className="font-semibold text-cyan-300 mt-0.5">{planet.stats.moons}</span>
                </div>
              </div>
            </div>
          </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
          {/* Audio Narration Button */}
          <button
            onClick={handleToggleAudio}
            className={`flex-1 min-h-[44px] flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-2xl border text-xs sm:text-sm font-bold transition shadow-lg shrink-0 ${
              isPlayingAudio
                ? "bg-amber-500 text-slate-950 border-amber-300 animate-pulse"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
            }`}
            title={isPlayingAudio ? "Tạm dừng thuyết minh" : "Nghe thuyết minh giọng AI"}
          >
            {isPlayingAudio ? <VolumeX size={16} /> : <Volume2 size={16} />}
            <span>{isPlayingAudio ? "Dừng Đọc" : "Nghe Thuyết Minh"}</span>
          </button>

          {/* Close / Done Button */}
          <button
            onClick={handleCloseModal}
            className="flex-1 min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs sm:text-sm font-bold shadow-md transition"
          >
            <X size={16} />
            <span>Đóng Chi Tiết</span>
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
