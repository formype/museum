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
  Menu,
  MoreVertical,
  BookOpen,
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

const EarthMoonLabModal = dynamic(
  () => import("@/components/earth-moon/EarthMoonLabModal"),
  { ssr: false }
);

const SpaceTutorChat = dynamic(
  () => import("@/components/ai/SpaceTutorChat"),
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
  const [isEarthMoonLabOpen, setIsEarthMoonLabOpen] = useState<boolean>(false);
  const [isPlanetDrawerOpen, setIsPlanetDrawerOpen] = useState<boolean>(false);
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState<boolean>(false);
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
            {/* Logo & School Title (Mobile: Chỉ hiện logo tối ưu không gian; Desktop: Hiện đầy đủ tên trường) */}
            <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto bg-slate-900/85 backdrop-blur-xl p-1.5 sm:px-4 sm:py-2 rounded-2xl border border-slate-700/60 shadow-xl shrink-0">
              <img
                src="/logo.png"
                alt="Trường THCS Lê Anh Xuân"
                className="w-9 h-9 sm:w-10 sm:h-10 object-contain rounded-full shadow-md shadow-cyan-500/20 shrink-0 border border-cyan-400/40 bg-white/10"
              />
              <div className="overflow-hidden hidden sm:block">
                <h1 className="text-xs sm:text-base font-bold text-white flex items-center gap-1.5 truncate">
                  <span className="truncate">THCS Lê Anh Xuân</span>
                  <span className="hidden md:inline-block text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
                    EduTech VR
                  </span>
                </h1>
                <p className="hidden md:block text-[11px] text-slate-400 truncate">
                  Hệ Mặt Trời 3D & Không Gian Sky Lab 360°
                </p>
              </div>
            </div>

            {/* Top Right Actions: AI mang icon ra ngoài, toàn bộ action còn lại gom vào nút Xem Thêm */}
            <div className="flex items-center gap-2 pointer-events-auto shrink-0">
              {/* PRIMARY ACTION: AI Chatbot (Mang icon ra ngoài) */}
              <button
                onClick={() => {
                  spaceAudio.playWarpSound();
                  setIsChatOpen(true);
                }}
                className="min-h-[42px] flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-purple-500/30 hover:scale-105 active:scale-95 transition-all border border-purple-300 shrink-0"
                title="Trợ lý AI Thiên Văn Học - Giải đáp thắc mắc vũ trụ"
              >
                <Sparkles size={16} className="text-amber-300 animate-spin-slow" />
                <span>Hỏi AI</span>
              </button>

              {/* ACTION: Nút Xem Thêm (Gom tất cả hành động vào đây) */}
              <div className="relative">
                <button
                  onClick={() => setIsToolsMenuOpen((prev) => !prev)}
                  className={`min-h-[42px] flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-2xl bg-slate-900/90 text-slate-200 border border-slate-700 hover:bg-slate-800 backdrop-blur-md text-xs sm:text-sm font-bold shadow-lg active:scale-95 transition shrink-0 ${
                    isToolsMenuOpen ? "border-cyan-400 bg-slate-800 text-cyan-300" : ""
                  }`}
                  title="Mở rộng tất cả các công cụ và chế độ khám phá"
                >
                  <MoreVertical size={16} className="text-cyan-400" />
                  <span>Xem Thêm</span>
                </button>

                {/* Dropdown Menu Chứa Đầy Đủ Hành Động */}
                {isToolsMenuOpen && (
                  <div className="absolute right-0 top-12 z-50 w-56 p-2 rounded-2xl bg-slate-900/95 border border-slate-700/80 backdrop-blur-2xl shadow-2xl space-y-1.5 animate-slide-up text-xs">
                    {/* 1. Trái Đất & Mặt Trăng */}
                    <button
                      onClick={() => {
                        spaceAudio.playWarpSound();
                        setIsEarthMoonLabOpen(true);
                        setIsToolsMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-cyan-300 hover:bg-slate-800 transition text-left font-bold"
                    >
                      <span className="text-base">🌍</span>
                      <span>Trái Đất & Mặt Trăng</span>
                    </button>

                    {/* 2. Khám phá Sky Lab 360° */}
                    <button
                      onClick={() => {
                        spaceAudio.playWarpSound();
                        setIsMuseumMenuOpen(true);
                        setIsToolsMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-amber-300 hover:bg-slate-800 transition text-left font-bold"
                    >
                      <Landmark size={15} className="text-amber-400" />
                      <span>Sky Lab 360°</span>
                    </button>

                    {/* 3. Danh sách hành tinh */}
                    <button
                      onClick={() => {
                        setIsPlanetDrawerOpen(true);
                        setIsToolsMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-200 hover:bg-slate-800 transition text-left"
                    >
                      <Layers size={15} className="text-cyan-400" />
                      <span>Chọn Hành Tinh (8 HT)</span>
                    </button>

                    <div className="h-px bg-slate-800 my-1" />

                    {/* 4. Quản trị CMS */}
                    <Link
                      href="/admin"
                      onClick={() => setIsToolsMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-200 hover:bg-slate-800 transition"
                    >
                      <Settings size={15} className="text-cyan-400" />
                      <span>Quản Trị CMS</span>
                    </Link>

                    {/* 5. Giao diện */}
                    <div className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-200 hover:bg-slate-800 transition">
                      <span className="flex items-center gap-2.5">
                        <Sparkles size={14} className="text-amber-400" />
                        Giao diện
                      </span>
                      <ThemeToggle variant="icon" />
                    </div>

                    {/* 6. Âm thanh nền */}
                    <button
                      onClick={() => {
                        toggleAmbientSound();
                        setIsToolsMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-200 hover:bg-slate-800 transition text-left"
                    >
                      <span className="flex items-center gap-2.5">
                        {ambientSoundOn ? <Volume2 size={15} className="text-amber-400" /> : <VolumeX size={15} />}
                        Âm thanh nền
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {ambientSoundOn ? "BẬT" : "TẮT"}
                      </span>
                    </button>

                    {/* 7. Tốc độ quay */}
                    <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between px-3 py-1">
                      <span className="text-[11px] text-slate-400">Tốc độ quay:</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSimSpeed((prev) => (prev === 0 ? 1 : 0))}
                          className={`px-1.5 py-0.5 rounded text-[11px] ${simSpeed === 0 ? "bg-amber-500 text-white font-bold" : "text-slate-400"}`}
                          title="Tạm dừng / Tiếp tục"
                        >
                          {simSpeed === 0 ? <Play size={10} /> : <Pause size={10} />}
                        </button>
                        <button
                          onClick={() => setSimSpeed(1)}
                          className={`px-1.5 py-0.5 rounded text-[11px] ${simSpeed === 1 ? "bg-cyan-500 text-white font-bold" : "text-slate-400"}`}
                        >
                          1x
                        </button>
                        <button
                          onClick={() => setSimSpeed(3)}
                          className={`px-1.5 py-0.5 rounded text-[11px] ${simSpeed === 3 ? "bg-cyan-500 text-white font-bold" : "text-slate-400"}`}
                        >
                          3x
                        </button>
                      </div>
                    </div>
                  </div>
                )}
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

          {/* Mobile Planet Drawer Modal (Thay thế thanh trượt nằm ngang ở giữa màn hình) */}
          {isPlanetDrawerOpen && (
            <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/75 backdrop-blur-sm animate-fade-in pointer-events-auto">
              <div className="w-full max-h-[75vh] bg-slate-900 border-t border-cyan-500/40 rounded-t-3xl p-4 shadow-2xl flex flex-col space-y-3 animate-slide-up">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Layers size={16} className="text-cyan-400" />
                    <span className="text-sm font-bold text-white uppercase tracking-wider">
                      Chọn Hành Tinh Học Tập
                    </span>
                  </div>
                  <button
                    onClick={() => setIsPlanetDrawerOpen(false)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Grid các thiên thể */}
                <div className="grid grid-cols-2 gap-2 overflow-y-auto no-scrollbar max-h-[55vh] py-1">
                  {Object.values(spacesData).map((p) => {
                    const isSelected = selectedPlanetForPreview?.id === p.id;
                    return (
                      <button
                        key={`mob-modal-${p.id}`}
                        onClick={() => {
                          spaceAudio.playWarpSound();
                          setSelectedPlanetForPreview(p);
                          setIsPlanetDrawerOpen(false);
                          setIsInspectorOpen(true);
                        }}
                        className={`flex items-center gap-2.5 p-2.5 rounded-2xl text-left border transition ${
                          isSelected
                            ? "bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-md"
                            : "bg-slate-950/70 text-slate-300 border-slate-800 active:bg-slate-800"
                        }`}
                      >
                        <span className="text-xl shrink-0">{p.aiContext.avatarEmoji}</span>
                        <div className="overflow-hidden">
                          <div className="font-bold text-xs truncate text-white">{p.name}</div>
                          <div className="text-[10px] text-cyan-400 font-medium truncate">{p.nameEn}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

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
                  <span>Vào Học 3D & Thuyết Minh</span>
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

          {/* Interactive Earth - Moon - Sun System Lab Modal */}
          {isEarthMoonLabOpen && (
            <EarthMoonLabModal
              isOpen={isEarthMoonLabOpen}
              onClose={() => setIsEarthMoonLabOpen(false)}
            />
          )}

          {/* AI Space Tutor Chatbot Modal */}
          {isChatOpen && (
            <SpaceTutorChat
              space={selectedPlanetForPreview || spacesData["sun"] || SPACES_DATA["sun"]}
              isOpen={isChatOpen}
              onClose={() => setIsChatOpen(false)}
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
