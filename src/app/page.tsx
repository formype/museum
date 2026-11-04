"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { SPACES_DATA, SpaceData } from "@/data/spaces";
import { SpaceRoom, DEFAULT_SPACE_ROOMS } from "@/data/space-exhibition";
import { getStoredSpaceRooms } from "@/lib/space-exhibition-storage";
import { getStoredSpaces } from "@/lib/spaces-storage";
import { spaceAudio } from "@/lib/audio-synth";
import SpaceRoomExplorer from "@/components/space/SpaceRoomExplorer";
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
  ChevronRight,
  Settings,
  Globe,
  X,
  Sparkles,
  MoreVertical,
  BookOpen,
  Moon,
  ArrowRight,
  ArrowLeft,
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

const EarthMoonLabModal = dynamic(
  () => import("@/components/earth-moon/EarthMoonLabModal"),
  { ssr: false }
);

const SpaceTutorChat = dynamic(
  () => import("@/components/ai/SpaceTutorChat"),
  { ssr: false }
);

export default function HomePage() {
  // Modes: 'solar_3d' | 'rooms_discovery'
  const [viewMode, setViewMode] = useState<"solar_3d" | "rooms_discovery">("solar_3d");
  const [spacesData, setSpacesData] = useState<Record<string, SpaceData>>(SPACES_DATA);
  const [rooms, setRooms] = useState<SpaceRoom[]>(DEFAULT_SPACE_ROOMS);
  const [selectedPlanetForPreview, setSelectedPlanetForPreview] = useState<SpaceData | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);
  const [isEarthMoonLabOpen, setIsEarthMoonLabOpen] = useState<boolean>(false);
  const [isPlanetDrawerOpen, setIsPlanetDrawerOpen] = useState<boolean>(false);
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState<boolean>(false);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [ambientSoundOn, setAmbientSoundOn] = useState<boolean>(false);

  useEffect(() => {
    const loadedSpaces = getStoredSpaces();
    setSpacesData(loadedSpaces);
    setSelectedPlanetForPreview(loadedSpaces["sun"] || Object.values(loadedSpaces)[0]);
    const loadedRooms = getStoredSpaceRooms();
    setRooms(loadedRooms);
  }, []);

  const toggleAmbientSound = () => {
    if (ambientSoundOn) {
      spaceAudio.stopAmbientSound();
      setAmbientSoundOn(false);
    } else {
      spaceAudio.startAmbientSound();
      setAmbientSoundOn(true);
    }
  };

  const handleSelectPlanet = (planet: SpaceData) => {
    spaceAudio.playWarpSound();
    setSelectedPlanetForPreview(planet);
    setIsInspectorOpen(true);
  };

  return (
    <main className="relative w-screen min-h-[100dvh] bg-slate-950 font-sans select-none overflow-x-hidden">
      {/* ========================================================================= */}
      {/* TOP HEADER NAVBAR (Giữ nguyên Logo & Tên Trường THCS Lê Anh Xuân)         */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 px-3 sm:px-5 py-2.5 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 shadow-xl flex items-center justify-between gap-2">
        {/* Logo & School Title (Ẩn tên trường trên mobile nhỏ, chỉ giữ lại logo tròn) */}
        <div className="flex items-center gap-2 pointer-events-auto shrink-0">
          <img
            src="/logo.png"
            alt="Trường THCS Lê Anh Xuân"
            className="w-9 h-9 sm:w-10 sm:h-10 object-contain rounded-full shadow-md shadow-cyan-500/20 shrink-0 border border-cyan-400/40 bg-white/10"
          />
          <div className="overflow-hidden hidden sm:block">
            <h1 className="text-xs sm:text-base font-extrabold text-white flex items-center gap-1.5 truncate">
              <span className="truncate">THCS Lê Anh Xuân</span>
              <span className="hidden md:inline-block text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
                EduTech VR
              </span>
            </h1>
            <p className="hidden md:block text-[11px] text-slate-400 truncate">
              Hệ Mặt Trời 3D & Khám Phá Vũ Trụ Học Đường
            </p>
          </div>
        </div>

        {/* Navigation & Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto shrink-0">
          {/* Switcher: 3D Hệ Mặt Trời vs Chuyên Đề Khám Phá */}
          <div className="flex items-center p-1 bg-slate-950/80 rounded-2xl border border-slate-800">
            <button
              onClick={() => {
                spaceAudio.playWarpSound();
                setViewMode("solar_3d");
              }}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                viewMode === "solar_3d"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Orbit size={14} />
              <span className="hidden sm:inline">3D Hệ Mặt Trời</span>
              <span className="sm:hidden">3D</span>
            </button>

            <button
              onClick={() => {
                spaceAudio.playWarpSound();
                setViewMode("rooms_discovery");
              }}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                viewMode === "rooms_discovery"
                  ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <BookOpen size={14} />
              <span className="hidden sm:inline">Chuyên Đề Vũ Trụ</span>
              <span className="sm:hidden">Chuyên Đề</span>
            </button>
          </div>

          {/* PRIMARY ACTION: Nút Hỏi AI */}
          <button
            onClick={() => {
              spaceAudio.playWarpSound();
              setIsChatOpen(true);
            }}
            className="min-h-[38px] flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-purple-500/30 hover:scale-105 active:scale-95 transition-all border border-purple-300 shrink-0"
            title="Trợ lý AI Thiên Văn Học - Giải đáp thắc mắc vũ trụ"
          >
            <Sparkles size={15} className="text-amber-300 animate-spin-slow" />
            <span className="font-bold">Hỏi AI</span>
          </button>

          {/* Earth-Moon Lab Quick Button */}
          <button
            onClick={() => {
              spaceAudio.playWarpSound();
              setIsEarthMoonLabOpen(true);
            }}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-semibold shadow transition"
            title="Phòng Lab Trái Đất - Mặt Trăng"
          >
            <Moon size={14} />
            <span>Lab Trái Đất - Mặt Trăng</span>
          </button>

          {/* Nút Xem Thêm (Tối ưu cho mobile: touch-friendly, icon gọn) */}
          <div className="relative">
            <button
              onClick={() => setIsToolsMenuOpen((prev) => !prev)}
              className={`min-h-[38px] min-w-[38px] flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-slate-900 text-slate-200 border border-slate-700 hover:bg-slate-800 backdrop-blur-md text-xs font-bold shadow-lg active:scale-95 transition shrink-0 ${
                isToolsMenuOpen ? "border-cyan-400 bg-slate-800 text-cyan-300 ring-2 ring-cyan-400/30" : ""
              }`}
              title="Mở thêm công cụ khám phá"
              aria-label="Xem Thêm"
            >
              <MoreVertical size={16} className="text-cyan-400 shrink-0" />
              <span className="hidden sm:inline">Xem Thêm</span>
            </button>

            {/* Dropdown Menu / Mobile Bottom Sheet */}
            {isToolsMenuOpen && (
              <>
                {/* Backdrop on mobile */}
                <div
                  className="sm:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                  onClick={() => setIsToolsMenuOpen(false)}
                />

                <div className="fixed sm:absolute bottom-0 sm:bottom-auto right-0 left-0 sm:left-auto sm:top-12 z-50 w-full sm:w-64 p-3 sm:p-2 rounded-t-3xl sm:rounded-2xl bg-slate-900/98 sm:bg-slate-900/95 border-t sm:border border-slate-700/80 backdrop-blur-2xl shadow-2xl space-y-2 sm:space-y-1.5 animate-slide-up text-xs">
                  {/* Mobile Drawer Header handle */}
                  <div className="sm:hidden flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="font-bold text-white text-sm flex items-center gap-2">
                      <MoreVertical size={16} className="text-cyan-400" />
                      Công Cụ Mở Rộng
                    </span>
                    <button
                      onClick={() => setIsToolsMenuOpen(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* 1. Trái Đất & Mặt Trăng */}
                  <button
                    onClick={() => {
                      spaceAudio.playWarpSound();
                      setIsEarthMoonLabOpen(true);
                      setIsToolsMenuOpen(false);
                    }}
                    className="w-full min-h-[44px] flex items-center gap-3 px-3 py-2.5 rounded-xl text-amber-300 hover:bg-slate-800 active:bg-slate-800 transition text-left font-bold"
                  >
                    <span className="text-xl">🌍</span>
                    <div className="overflow-hidden">
                      <div className="font-bold">Lab Trái Đất & Mặt Trăng</div>
                      <div className="text-[10px] text-slate-400 font-normal">Mô phỏng quỹ đạo, tuần trăng & nhật nguyệt thực</div>
                    </div>
                  </button>

                  {/* 2. Danh sách hành tinh */}
                  <button
                    onClick={() => {
                      setIsPlanetDrawerOpen(true);
                      setIsToolsMenuOpen(false);
                    }}
                    className="w-full min-h-[44px] flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-200 hover:bg-slate-800 active:bg-slate-800 transition text-left"
                  >
                    <Layers size={18} className="text-cyan-400 shrink-0" />
                    <div className="overflow-hidden">
                      <div className="font-bold">Chọn Thiên Thể (8 Hành Tinh)</div>
                      <div className="text-[10px] text-slate-400 font-normal">Xem mô hình 3D xoay & khoảng cách từ Trái Đất</div>
                    </div>
                  </button>

                  <div className="h-px bg-slate-800 my-1" />

                  {/* 3. Quản trị CMS */}
                  <Link
                    href="/admin"
                    onClick={() => setIsToolsMenuOpen(false)}
                    className="w-full min-h-[44px] flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-200 hover:bg-slate-800 active:bg-slate-800 transition"
                  >
                    <Settings size={18} className="text-cyan-400 shrink-0" />
                    <div className="overflow-hidden">
                      <div className="font-bold">Cài Đặt / Quản Trị</div>
                      <div className="text-[10px] text-slate-400 font-normal">Sửa tiêu đề chuyên đề, video YouTube & đố vui</div>
                    </div>
                  </Link>

                  {/* 4. Giao diện */}
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-200">
                    <span className="flex items-center gap-2.5 font-semibold">
                      <Sparkles size={16} className="text-amber-400" />
                      Giao diện Sáng / Tối
                    </span>
                    <ThemeToggle variant="icon" />
                  </div>

                  {/* 5. Âm thanh nền */}
                  <button
                    onClick={() => {
                      toggleAmbientSound();
                      setIsToolsMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-200 hover:bg-slate-800 transition text-left font-semibold"
                  >
                    <span className="flex items-center gap-2.5">
                      {ambientSoundOn ? <Volume2 size={16} className="text-amber-400" /> : <VolumeX size={16} />}
                      Âm thanh không gian
                    </span>
                    <span className="text-[11px] font-mono text-cyan-400 font-bold">
                      {ambientSoundOn ? "ĐANG BẬT" : "ĐANG TẮT"}
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* CHẾ ĐỘ 1: 3D HỆ MẶT TRỜI (GIỮ NGUYÊN LEFT MENU CÁC HÀNH TINH NHƯ CŨ)        */}
      {/* ========================================================================= */}
      {viewMode === "solar_3d" && (
        <div className="relative w-full h-[calc(100dvh-60px)] overflow-hidden">
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

          {/* Desktop Left Planet List Drawer (GIỮ NGUYÊN MENU TRÁI CÁC HÀNH TINH NHƯ CŨ) */}
          <div className="absolute top-4 left-4 z-20 hidden md:flex flex-col gap-1.5 max-h-[75vh] overflow-y-auto pr-2 bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800/80 backdrop-blur-md shadow-2xl">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1 flex items-center gap-1.5">
              <Layers size={13} className="text-cyan-400" />
              Chọn Thiên Thể
            </span>
            {Object.values(spacesData).map((p) => {
              const isSelected = selectedPlanetForPreview?.id === p.id;
              return (
                <button
                  key={`pill-${p.id}`}
                  onClick={() => handleSelectPlanet(p)}
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

          {/* Mobile Planet Drawer Button */}
          <button
            onClick={() => setIsPlanetDrawerOpen(true)}
            className="md:hidden absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/90 text-cyan-300 border border-slate-700 backdrop-blur-md text-xs font-bold shadow-lg"
          >
            <Layers size={15} />
            <span>Chọn Thiên Thể ({Object.keys(spacesData).length})</span>
          </button>

          {/* Mobile Planet Drawer Modal */}
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

                <div className="grid grid-cols-2 gap-2 overflow-y-auto max-h-[55vh] py-1">
                  {Object.values(spacesData).map((p) => {
                    const isSelected = selectedPlanetForPreview?.id === p.id;
                    return (
                      <button
                        key={`mob-modal-${p.id}`}
                        onClick={() => {
                          handleSelectPlanet(p);
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

          {/* Quick Banner: Khám phá Chuyên Đề Vũ Trụ */}
          <div className="absolute top-4 right-4 z-20 hidden md:block">
            <button
              onClick={() => {
                spaceAudio.playWarpSound();
                setViewMode("rooms_discovery");
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600/90 to-indigo-600/90 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-xs shadow-xl backdrop-blur-md border border-purple-400/50 hover:scale-105 transition"
            >
              <span>🚀</span>
              <span>Chuyên Đề Khám Phá Vũ Trụ</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CHẾ ĐỘ 2: 3 PHÒNG KHÁM PHÁ VŨ TRỤ (CUỘN MƯỢT MÀ, VIDEO YOUTUBE & QUIZ)    */}
      {/* ========================================================================= */}
      {viewMode === "rooms_discovery" && (
        <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-fade-in">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-purple-950/60 via-slate-900 to-cyan-950/50 p-4 sm:p-6 rounded-3xl border border-purple-500/20 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1.5 text-center md:text-left">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-purple-300 bg-purple-950/80 px-3 py-1 rounded-full border border-purple-800/80">
                <span>🌟</span>
                <span>Trường THCS Lê Anh Xuân • Không Gian Khám Phá Vũ Trụ</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white">
                Cùng Khám Phá 3 Phòng Học Chuyên Đề Vũ Trụ
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Các bài học được biên soạn ngắn gọn, tích hợp giọng đọc Nữ AI truyền cảm, video YouTube trực quan,
                ảnh tư liệu NASA và bộ câu hỏi đố vui trắc nghiệm tương tác cho học sinh.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  spaceAudio.playWarpSound();
                  setViewMode("solar_3d");
                }}
                className="px-4 py-2.5 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-300 text-xs font-bold transition flex items-center gap-2 shadow"
              >
                <Orbit size={15} />
                <span>Quay Về 3D Hệ Mặt Trời</span>
              </button>
            </div>
          </div>

          {/* The 3 Main Discovery Rooms Component */}
          <SpaceRoomExplorer
            rooms={rooms}
            onOpenSolar3D={() => setViewMode("solar_3d")}
            onOpenEarthMoonLab={() => setIsEarthMoonLabOpen(true)}
          />

          {/* Footer */}
          <footer className="mt-8 pt-6 border-t border-slate-900 text-center text-xs text-slate-500">
            <p className="font-semibold text-slate-400">Trường THCS Lê Anh Xuân • Dự Án Khoa Học & Khám Phá Vũ Trụ Trực Quan</p>
          </footer>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL WINDOWS                                                             */}
      {/* ========================================================================= */}

      {/* Modal 1: 3D Planet Inspector */}
      {isInspectorOpen && selectedPlanetForPreview && (
        <Planet3DInspectorModal
          planet={selectedPlanetForPreview}
          onClose={() => setIsInspectorOpen(false)}
        />
      )}

      {/* Modal 2: Earth Moon Lab */}
      {isEarthMoonLabOpen && (
        <EarthMoonLabModal
          isOpen={isEarthMoonLabOpen}
          onClose={() => setIsEarthMoonLabOpen(false)}
        />
      )}

      {/* Modal 3: AI Space Tutor Chat */}
      {isChatOpen && (
        <SpaceTutorChat
          space={selectedPlanetForPreview || spacesData["sun"] || SPACES_DATA["sun"]}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </main>
  );
}
