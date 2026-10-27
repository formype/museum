"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { SPACES_DATA, SpaceData } from "@/data/spaces";
import { INITIAL_MUSEUMS, MuseumSite } from "@/data/museums-directory";
import { getStoredSpaces, getStoredMuseumSites } from "@/lib/spaces-storage";
import { spaceAudio } from "@/lib/audio-synth";
import Viewer360 from "@/components/tour/Viewer360";
import AudioNarrator from "@/components/tour/AudioNarrator";
import SpaceTutorChat from "@/components/ai/SpaceTutorChat";
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
} from "lucide-react";

// Dynamically import Three.js Solar Canvas
const SolarSystemCanvas = dynamic(
  () => import("@/components/3d/SolarSystemCanvas"),
  { ssr: false }
);

export default function HomePage() {
  // Modes: 'solar_3d' | 'tour_360' | 'museum_360'
  const [viewMode, setViewMode] = useState<"solar_3d" | "tour_360" | "museum_360">("solar_3d");
  const [spacesData, setSpacesData] = useState<Record<string, SpaceData>>(SPACES_DATA);
  const [museumSitesData, setMuseumSitesData] = useState<Record<string, MuseumSite>>(INITIAL_MUSEUMS);
  const [activeSpaceId, setActiveSpaceId] = useState<string>("sun");
  const [activeMuseumId, setActiveMuseumId] = useState<string>("history-museum-vn");
  const [activeMuseumRoomId, setActiveMuseumRoomId] = useState<string>("grand-hall");
  const [selectedPlanetForPreview, setSelectedPlanetForPreview] = useState<SpaceData | null>(null);
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

  const handleEnter360Tour = (spaceId: string) => {
    spaceAudio.playWarpSound();
    setActiveSpaceId(spaceId);
    setViewMode("tour_360");
  };

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
              onSelectSpace={(space) => setSelectedPlanetForPreview(space)}
              onOpenDetail={(space) => handleEnter360Tour(space.id)}
              selectedSpace={selectedPlanetForPreview}
              speed={simSpeed}
            />
          </div>

          {/* Top Header Navbar */}
          <header className="relative z-30 pt-[max(0.75rem,env(safe-area-inset-top))] px-3 sm:px-5 py-2 sm:py-3 flex items-center justify-between pointer-events-none gap-2">
            {/* Logo & Title */}
            <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto bg-slate-900/85 backdrop-blur-xl px-2.5 sm:px-4 py-2 rounded-2xl border border-slate-700/60 shadow-xl max-w-[48vw] xs:max-w-[56vw] sm:max-w-none shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/40 shrink-0">
                <Orbit size={18} className="animate-spin [animation-duration:12s]" />
              </div>
              <div className="overflow-hidden">
                <h1 className="text-xs sm:text-base font-bold text-white flex items-center gap-1.5 truncate">
                  <span className="sm:hidden">Solar 360°</span>
                  <span className="hidden sm:inline">Solar & Museum 360°</span>
                  <span className="hidden md:inline-block text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
                    EduTech VR
                  </span>
                </h1>
                <p className="hidden md:block text-[11px] text-slate-400 truncate">
                  Hệ Mặt Trời 3D & Khám Phá Nhiều Bảo Tàng 360°
                </p>
              </div>
            </div>

            {/* Quick Actions (Switch to Museum Menu, Admin CMS, Audio, Speed) */}
            <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto shrink-0">
              {/* Button: Mở Menu Chọn Bảo Tàng */}
              <button
                onClick={() => setIsMuseumMenuOpen(true)}
                className="min-h-[44px] flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 text-white font-bold text-xs sm:text-sm shadow-xl shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all border border-amber-300 shrink-0"
              >
                <Landmark size={15} />
                <span>🏛️ Bảo Tàng</span>
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
                  }}
                  onDoubleClick={() => handleEnter360Tour(p.id)}
                  title={`${p.name} (Click đúp để mở chi tiết 360°)`}
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
                  }}
                  onDoubleClick={() => handleEnter360Tour(p.id)}
                  title={`${p.name} (Click đúp để mở chi tiết 360°)`}
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

                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {selectedPlanetForPreview.category.replace("_", " ")}
                </span>
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

              {/* Action Button */}
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => handleEnter360Tour(selectedPlanetForPreview.id)}
                  className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-cyan-500/30 hover:scale-[1.02] active:scale-95 transition"
                >
                  <Eye size={16} />
                  <span>Vào Khám Phá 360° VR</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: IMMERSIVE 360 VIRTUAL TOUR VIEW (SPACE)                           */}
      {/* ========================================================================= */}
      {viewMode === "tour_360" && (
        <div className="relative w-full h-full">
          {/* Synchronized Audio Narration Player & Subtitles */}
          <AudioNarrator
            narration={activeSpace.audioNarration}
            spaceName={activeSpace.name}
          />

          {/* 360 Virtual Tour Panoramic Viewer */}
          <Viewer360
            space={activeSpace}
            onNavigateSpace={(newSpaceId) => setActiveSpaceId(newSpaceId)}
            onOpenChat={() => setIsChatOpen(true)}
            onBackToMain={handleBackTo3D}
            onOpenMuseumMenu={() => setIsMuseumMenuOpen(true)}
          />

          {/* AI Chatbot Drawer */}
          <SpaceTutorChat
            space={activeSpace}
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: GOOGLE STREET VIEW MULTI-MUSEUM 360 TOUR                          */}
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
