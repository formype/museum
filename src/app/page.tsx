"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { SPACES_DATA, SpaceData } from "@/data/spaces";
import { INITIAL_MUSEUMS, MuseumSite } from "@/data/museums-directory";
import { getStoredSpaces, getStoredMuseumSites } from "@/lib/spaces-storage";
import { spaceAudio } from "@/lib/audio-synth";
import MuseumViewer360 from "@/components/museum/MuseumViewer360";
import MuseumSelectorMenu from "@/components/museum/MuseumSelectorMenu";
import ThemeToggle from "@/components/ui/ThemeToggle";
import {
  Orbit,
  Play,
  Pause,
  Layers,
  Thermometer,
  Clock,
  Volume2,
  VolumeX,
  Eye,
  ChevronRight,
  RotateCcw,
  Landmark,
  Settings,
  Globe,
  X,
  Sparkles,
  Compass,
} from "lucide-react";

// Dynamically import Three.js Solar Canvas & 3D Planet Inspector
const SolarSystemCanvas = dynamic(
  () => import("@/components/3d/SolarSystemCanvas"),
  { ssr: false }
);

const Planet3DInspectorModal = dynamic(
  () => import("@/components/3d/Planet3DInspectorModal"),
  { ssr: false }
);

export default function HomePage() {
  // Modes: 'solar_3d' | 'museum_360'
  const [viewMode, setViewMode] = useState<"solar_3d" | "museum_360">("solar_3d");
  const [spacesData, setSpacesData] = useState<Record<string, SpaceData>>(SPACES_DATA);
  const [museumSitesData, setMuseumSitesData] = useState<Record<string, MuseumSite>>(INITIAL_MUSEUMS);
  const [activeSpaceId, setActiveSpaceId] = useState<string>("sun");
  const [activeMuseumId, setActiveMuseumId] = useState<string>("history-museum-vn");
  const [activeMuseumRoomId, setActiveMuseumRoomId] = useState<string>("grand-hall");
  const [selectedPlanetForPreview, setSelectedPlanetForPreview] = useState<SpaceData | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isMuseumMenuOpen, setIsMuseumMenuOpen] = useState<boolean>(false);
  const [ambientSoundOn, setAmbientSoundOn] = useState<boolean>(false);

  useEffect(() => {
    const loadedSpaces = getStoredSpaces();
    const loadedMuseums = getStoredMuseumSites();
    setSpacesData(loadedSpaces);
    setMuseumSitesData(loadedMuseums);
    setSelectedPlanetForPreview(loadedSpaces["sun"] || Object.values(loadedSpaces)[0]);
    const firstMusId = Object.keys(loadedMuseums)[0] || "history-museum-vn";
    setActiveMuseumId(firstMusId);
    setActiveMuseumRoomId(loadedMuseums[firstMusId]?.defaultRoomId || "grand-hall");
  }, []);

  const activeSpace = spacesData[activeSpaceId] || spacesData["sun"] || SPACES_DATA["sun"];
  const activeMuseum = museumSitesData[activeMuseumId] || museumSitesData["history-museum-vn"] || INITIAL_MUSEUMS["history-museum-vn"];
  const activeMuseumRoom =
    activeMuseum.rooms[activeMuseumRoomId] ||
    Object.values(activeMuseum.rooms)[0] ||
    INITIAL_MUSEUMS["history-museum-vn"].rooms["grand-hall"];

  const handleEnterMuseumTour = (museumId = "history-museum-vn", roomId?: string) => {
    spaceAudio.playWarpSound();
    const site = museumSitesData[museumId] || activeMuseum;
    setActiveMuseumId(site.id);
    setActiveMuseumRoomId(roomId || site.defaultRoomId || Object.keys(site.rooms)[0]);
    setViewMode("museum_360");
  };

  const handleBackTo3D = () => {
    spaceAudio.playWarpSound();
    setViewMode("solar_3d");
  };

  const toggleAmbientSound = () => {
    if (ambientSoundOn) {
      spaceAudio.stopAmbientSound();
      setAmbientSoundOn(false);
    } else {
      spaceAudio.startAmbientSound();
      setAmbientSoundOn(true);
    }
  };

  return (
    <main className="relative w-screen h-[100dvh] overflow-hidden bg-slate-950 select-none">
      {/* Museum Selection Modal */}
      <MuseumSelectorMenu
        isOpen={isMuseumMenuOpen}
        onClose={() => setIsMuseumMenuOpen(false)}
        museums={museumSitesData}
        currentMuseumId={activeMuseum.id}
        onSelectMuseum={(musId, rId) => {
          handleEnterMuseumTour(musId, rId);
        }}
      />

      {/* ========================================================================= */}
      {/* MODE 1: 3D SOLAR SYSTEM MACRO VIEW (Landing Page)                         */}
      {/* ========================================================================= */}
      {viewMode === "solar_3d" && (
        <div className="relative w-full h-full flex flex-col justify-between">
          {/* 3D Canvas Background */}
          <div className="absolute inset-0 z-0">
            <SolarSystemCanvas
              onSelectSpace={(space) => {
                setSelectedPlanetForPreview(space);
                setIsInspectorOpen(true);
              }}
              onOpenDetail={(space) => {
                setSelectedPlanetForPreview(space);
                setIsInspectorOpen(true);
              }}
              selectedSpace={selectedPlanetForPreview}
              speed={simSpeed}
            />
          </div>

          {/* Top Header Navbar */}
          <header className="relative z-30 pt-[max(0.75rem,env(safe-area-inset-top))] px-3 sm:px-5 py-2 sm:py-3 flex items-center justify-between pointer-events-none gap-2">
            {/* Logo & Title */}
            <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto bg-slate-900/85 backdrop-blur-xl px-2.5 sm:px-4 py-2 rounded-2xl border border-slate-700/60 shadow-xl max-w-[58vw] xs:max-w-[65vw] sm:max-w-none shrink-0">
              <img
                src="/logo.png"
                alt="Trường THCS Lê Anh Xuân"
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain rounded-full shadow-md shadow-cyan-500/20 shrink-0 border border-cyan-400/40 bg-white/10"
              />
              <div className="overflow-hidden">
                <h1 className="text-xs sm:text-base font-bold text-white flex items-center gap-1.5 truncate">
                  <span className="sm:hidden">THCS Lê Anh Xuân</span>
                  <span className="hidden sm:inline">THCS Lê Anh Xuân • Sky Lab 360°</span>
                  <span className="hidden md:inline-block text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
                    EduTech VR
                  </span>
                </h1>
                <p className="hidden md:block text-[11px] text-slate-400 truncate">
                  Hệ Mặt Trời 3D & Không Gian Sky Lab 360°
                </p>
              </div>
            </div>

            {/* Quick Actions (Switch to Sky Lab Menu, Admin CMS, Audio, Speed) */}
            <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto shrink-0">
              {/* Button: Mở Menu Chọn Sky Lab */}
              <button
                onClick={() => setIsMuseumMenuOpen(true)}
                className="min-h-[44px] flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 text-white font-bold text-xs sm:text-sm shadow-xl shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all border border-amber-300 shrink-0"
              >
                <Landmark size={15} />
                <span>🏛️ Sky Lab</span>
              </button>

              {/* Button: Admin CMS */}
              <Link
                href="/admin"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-900/90 text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-800 backdrop-blur-md text-xs font-semibold hover:scale-105 transition shadow-lg shrink-0"
                title="Quản trị viên (Admin CMS)"
              >
                <Settings size={15} className="text-cyan-400" />
                <span className="hidden md:inline">Quản Trị</span>
              </Link>

              {/* Theme Toggle (Sáng / Tối) */}
              <ThemeToggle variant="icon" />

              {/* Ambient Audio Toggle */}
              <button
                onClick={toggleAmbientSound}
                className={`min-h-[44px] min-w-[44px] p-2.5 rounded-2xl backdrop-blur-md border transition-all shadow-lg flex items-center justify-center shrink-0 ${
                  ambientSoundOn
                    ? "bg-amber-500 text-white border-amber-400 shadow-amber-500/30"
                    : "bg-slate-900/80 text-slate-300 border-slate-700 hover:bg-slate-800"
                }`}
                title="Âm thanh vũ trụ"
              >
                {ambientSoundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>

              {/* Simulation Speed Switch */}
              <div className="hidden md:flex items-center gap-1 bg-slate-900/80 backdrop-blur-md p-1 rounded-xl border border-slate-700/60 text-xs font-semibold text-slate-300">
                <button
                  onClick={() => setSimSpeed((prev) => (prev === 0 ? 1 : 0))}
                  className={`px-2 py-1 rounded-lg transition ${
                    simSpeed === 0 ? "bg-amber-500 text-white" : "hover:bg-slate-800"
                  }`}
                  title="Tạm dừng / Tiếp tục"
                >
                  {simSpeed === 0 ? <Play size={12} /> : <Pause size={12} />}
                </button>
                <button
                  onClick={() => setSimSpeed(1)}
                  className={`px-2 py-1 rounded-lg transition ${
                    simSpeed === 1 ? "bg-cyan-500 text-white" : "hover:bg-slate-800"
                  }`}
                >
                  1x
                </button>
                <button
                  onClick={() => setSimSpeed(3)}
                  className={`px-2 py-1 rounded-lg transition ${
                    simSpeed === 3 ? "bg-cyan-500 text-white" : "hover:bg-slate-800"
                  }`}
                >
                  3x
                </button>
              </div>
            </div>
          </header>

          {/* Desktop Left Planet List Drawer */}
          <div className="absolute top-24 left-6 z-20 hidden md:flex flex-col gap-1.5 max-h-[60vh] overflow-y-auto pr-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1 flex items-center gap-1">
              <Layers size={12} className="text-cyan-400" />
              Chọn Thiên Thể
            </span>
            {Object.values(spacesData).map((p) => {
              const isSelected = selectedPlanetForPreview?.id === p.id;
              return (
                <button
                  key={`pill-${p.id}`}
                  onClick={() => {
                    spaceAudio.playWarpSound();
                    setSelectedPlanetForPreview(p);
                    setIsInspectorOpen(true);
                  }}
                  title={`${p.name} (Click để xem chi tiết 3D & thông số)`}
                  className={`flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all border ${
                    isSelected
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/60 shadow-lg shadow-cyan-500/20 scale-105"
                      : "bg-slate-900/60 text-slate-300 border-slate-800/80 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{p.aiContext.avatarEmoji}</span>
                    <span>{p.name}</span>
                  </div>
                  <ChevronRight size={14} className={isSelected ? "text-cyan-400" : "text-slate-600"} />
                </button>
              );
            })}
          </div>

          {/* Mobile Horizontal Carousel */}
          <div className="md:hidden relative z-20 px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full pointer-events-auto">
            {Object.values(spacesData).map((p) => {
              const isSelected = selectedPlanetForPreview?.id === p.id;
              return (
                <button
                  key={`mob-pill-${p.id}`}
                  onClick={() => {
                    spaceAudio.playWarpSound();
                    setSelectedPlanetForPreview(p);
                    setIsInspectorOpen(true);
                  }}
                  title={`${p.name} (Click để xem chi tiết 3D)`}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border shrink-0 ${
                    isSelected
                      ? "bg-cyan-500 text-white border-cyan-300 shadow-md shadow-cyan-500/40 scale-105"
                      : "bg-slate-900/80 text-slate-300 border-slate-700/60"
                  }`}
                >
                  <span>{p.aiContext.avatarEmoji}</span>
                  <span>{p.name}</span>
                </button>
              );
            })}
          </div>

          {/* Planet Detail Preview Bottom Sheet */}
          {selectedPlanetForPreview && (
            <div className="relative z-30 p-3 sm:p-5 m-3 sm:m-6 sm:left-auto sm:right-6 sm:w-96 bg-slate-900/90 backdrop-blur-2xl border border-cyan-500/30 rounded-3xl shadow-2xl text-white animate-slide-up">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl shadow-inner shrink-0">
                    {selectedPlanetForPreview.aiContext.avatarEmoji}
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                      {selectedPlanetForPreview.name}
                    </h2>
                    <p className="text-xs text-cyan-400 font-medium">
                      {selectedPlanetForPreview.nameEn}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {selectedPlanetForPreview.category.replace("_", " ")}
                  </span>
                  <button
                    onClick={() => setSelectedPlanetForPreview(null)}
                    className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* Prominent Earth Distance Indicator */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-xs mb-2">
                <Globe size={15} className="text-cyan-400 shrink-0" />
                <div className="overflow-hidden">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">Khoảng cách từ Trái Đất:</span>
                  <span className="font-semibold text-white text-xs truncate block">
                    {selectedPlanetForPreview.stats.distanceFromEarth || selectedPlanetForPreview.stats.distanceFromSun}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 mb-2.5 leading-relaxed line-clamp-2">
                {selectedPlanetForPreview.tagline}
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2 my-2.5 p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Thermometer size={13} className="text-amber-400 shrink-0" />
                  <span className="truncate">{selectedPlanetForPreview.stats.temperature}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Clock size={13} className="text-blue-400 shrink-0" />
                  <span className="truncate">Ngày: {selectedPlanetForPreview.stats.dayLength}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => setIsInspectorOpen(true)}
                  className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-cyan-500/30 hover:scale-[1.02] active:scale-95 transition"
                  title="Mở xem mô hình 3D thực tế, trục nghiêng & ngày đêm"
                >
                  <Sparkles size={16} className="text-cyan-200" />
                  <span>Xem Chi Tiết 3D & Ngày Đêm</span>
                </button>
              </div>
            </div>
          )}

          {/* Detailed 3D Planet Inspector Modal with OrbitControls, Zoom & Realistic Textures */}
          {isInspectorOpen && selectedPlanetForPreview && (
            <Planet3DInspectorModal
              planet={selectedPlanetForPreview}
              onClose={() => setIsInspectorOpen(false)}
            />
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 360 VIRTUAL TOUR VIEW (CHỈ DÀNH CHO BẢO TÀNG / SKY LAB)                    */}
      {/* ========================================================================= */}
      {viewMode === "museum_360" && (
        <div className="relative w-full h-full">
          <MuseumViewer360
            currentMuseum={activeMuseum}
            currentRoom={activeMuseumRoom}
            allMuseums={museumSitesData}
            onSelectMuseum={(musId, rId) => handleEnterMuseumTour(musId, rId)}
            onNavigateRoom={(roomId) => setActiveMuseumRoomId(roomId)}
            onBackToMain={handleBackTo3D}
          />
        </div>
      )}
    </main>
  );
}
