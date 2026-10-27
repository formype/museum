"use client";

import React from "react";
import Link from "next/link";
import ThemeToggle from "../ui/ThemeToggle";
import {
  Smartphone,
  Volume2,
  VolumeX,
  RotateCw,
  Maximize2,
  Minimize2,
  Camera,
  Award,
  Compass,
  Settings,
  X,
  Sparkles,
  Trophy,
  Play,
  Pause,
  ExternalLink,
  Landmark,
  Orbit,
} from "lucide-react";

interface QuickToolsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  gyroActive: boolean;
  onToggleGyro: () => void;
  ambientAudioOn: boolean;
  onToggleAmbientAudio: () => void;
  autoRotate: boolean;
  onToggleAutoRotate: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onOpenSnapshot: () => void;
  onOpenBadges: () => void;
  onOpenQuiz?: () => void;
  isAutoTourActive?: boolean;
  onToggleAutoTour?: () => void;
  onOpenChat?: () => void;
  showRadar?: boolean;
  onToggleRadar?: () => void;
  accentColor?: "cyan" | "amber";
  isSpaceMode?: boolean;
  onBackToMain?: () => void;
  onSwitchMode?: () => void;
  switchModeLabel?: string;
}

export default function QuickToolsDrawer({
  isOpen,
  onClose,
  gyroActive,
  onToggleGyro,
  ambientAudioOn,
  onToggleAmbientAudio,
  autoRotate,
  onToggleAutoRotate,
  isFullscreen,
  onToggleFullscreen,
  onOpenSnapshot,
  onOpenBadges,
  onOpenQuiz,
  isAutoTourActive = false,
  onToggleAutoTour,
  onOpenChat,
  showRadar = false,
  onToggleRadar,
  accentColor = "cyan",
  isSpaceMode = true,
  onBackToMain,
  onSwitchMode,
  switchModeLabel,
}: QuickToolsDrawerProps) {
  if (!isOpen) return null;

  const isAmber = accentColor === "amber";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      {/* Backdrop tap to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Card */}
      <div
        className={`relative z-10 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border shadow-2xl overflow-hidden text-white flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-slide-up pb-[max(1rem,env(safe-area-inset-bottom))] ${
          isAmber
            ? "bg-stone-950/95 border-amber-500/40 shadow-amber-500/10"
            : "bg-slate-950/95 border-cyan-500/40 shadow-cyan-500/10"
        }`}
      >
        {/* Top Handle indicator on Mobile */}
        <div className="w-12 h-1.5 bg-slate-700/60 rounded-full mx-auto mt-3 sm:hidden" />

        {/* Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center text-sm font-bold shadow-inner ${
                isAmber
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
              }`}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                Bảng Tiện Ích & Điều Khiển 360°
              </h2>
              <p className="text-xs text-slate-400">
                Tối ưu trải nghiệm không viền & cảm biến
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] p-2.5 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition flex items-center justify-center active:scale-95"
            title="Đóng bảng công cụ"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body Content - Tools Grid */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[calc(88vh-80px)] no-scrollbar">
          {/* 1. Featured Interactive Activities (Quiz & Auto-Tour) */}
          {(onOpenQuiz || onToggleAutoTour) && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                Hoạt Động Khám Phá Nổi Bật
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Quiz & Certificate Card */}
                {onOpenQuiz && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenQuiz();
                    }}
                    className="min-h-[56px] p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-400/50 text-left flex items-center gap-3 transition active:scale-95 group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/40 shrink-0 group-hover:scale-105 transition">
                      <Trophy size={18} />
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-amber-200 truncate">
                        Đố Vui Chứng Chỉ
                      </div>
                      <div className="text-[10px] text-amber-300/80 truncate">
                        Nhận chứng chỉ vinh danh
                      </div>
                    </div>
                  </button>
                )}

                {/* Auto Tour Guide Card */}
                {onToggleAutoTour && (
                  <button
                    onClick={() => {
                      onToggleAutoTour();
                    }}
                    className={`min-h-[56px] p-3 rounded-2xl border text-left flex items-center gap-3 transition active:scale-95 ${
                      isAutoTourActive
                        ? "bg-emerald-500/25 border-emerald-400 text-white shadow-lg shadow-emerald-500/20"
                        : "bg-slate-900/80 border-slate-800 hover:bg-slate-850 text-slate-300"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shadow-md shrink-0 transition ${
                        isAutoTourActive
                          ? "bg-emerald-500 text-white animate-pulse"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {isAutoTourActive ? <Pause size={18} /> : <Play size={18} />}
                    </div>
                    <div className="overflow-hidden flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold truncate">Tour Tự Động</span>
                        <span
                          className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full uppercase ${
                            isAutoTourActive
                              ? "bg-emerald-500 text-black font-extrabold"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {isAutoTourActive ? "BẬT" : "TẮT"}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {isAutoTourActive ? "Đang thuyết minh tour" : "Dẫn đường tự động 360°"}
                      </div>
                    </div>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 2. Sensor & Environment Controls Grid (2x2) */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
              Cảm Biến & Tương Tác Toàn Cảnh
            </span>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Gyroscope VR Toggle */}
              <button
                onClick={onToggleGyro}
                className={`min-h-[64px] p-3 rounded-2xl border text-left flex flex-col justify-between transition-all active:scale-95 ${
                  gyroActive
                    ? "bg-emerald-500/20 border-emerald-400 text-white shadow-lg shadow-emerald-500/20"
                    : "bg-slate-900/80 border-slate-800 hover:bg-slate-800/80 text-slate-300"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <Smartphone
                    size={18}
                    className={gyroActive ? "text-emerald-400 animate-pulse" : "text-slate-400"}
                  />
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full uppercase ${
                      gyroActive
                        ? "bg-emerald-500 text-black font-extrabold"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {gyroActive ? "BẬT" : "TẮT"}
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold">Cảm Biến Nghiêng</div>
                  <div className="text-[10px] text-slate-400">Xoay máy nhìn 360° VR</div>
                </div>
              </button>

              {/* Ambient Audio Toggle */}
              <button
                onClick={onToggleAmbientAudio}
                className={`min-h-[64px] p-3 rounded-2xl border text-left flex flex-col justify-between transition-all active:scale-95 ${
                  ambientAudioOn
                    ? "bg-amber-500/20 border-amber-400 text-white shadow-lg shadow-amber-500/20"
                    : "bg-slate-900/80 border-slate-800 hover:bg-slate-800/80 text-slate-300"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  {ambientAudioOn ? (
                    <Volume2 size={18} className="text-amber-400" />
                  ) : (
                    <VolumeX size={18} className="text-slate-400" />
                  )}
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full uppercase ${
                      ambientAudioOn
                        ? "bg-amber-500 text-black font-extrabold"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {ambientAudioOn ? "BẬT" : "TẮT"}
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold">Âm Thanh Nền</div>
                  <div className="text-[10px] text-slate-400">Không gian vũ trụ & bảo tàng</div>
                </div>
              </button>

              {/* Auto-Rotate 360 Toggle */}
              <button
                onClick={onToggleAutoRotate}
                className={`min-h-[64px] p-3 rounded-2xl border text-left flex flex-col justify-between transition-all active:scale-95 ${
                  autoRotate
                    ? "bg-cyan-500/20 border-cyan-400 text-white shadow-lg shadow-cyan-500/20"
                    : "bg-slate-900/80 border-slate-800 hover:bg-slate-800/80 text-slate-300"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <RotateCw
                    size={18}
                    className={autoRotate ? "text-cyan-400 animate-spin" : "text-slate-400"}
                  />
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full uppercase ${
                      autoRotate
                        ? "bg-cyan-500 text-black font-extrabold"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {autoRotate ? "BẬT" : "TẮT"}
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold">Tự Động Xoay</div>
                  <div className="text-[10px] text-slate-400">Quay vòng góc nhìn 360°</div>
                </div>
              </button>

              {/* MiniMap Radar Toggle */}
              {onToggleRadar && (
                <button
                  onClick={onToggleRadar}
                  className={`min-h-[64px] p-3 rounded-2xl border text-left flex flex-col justify-between transition-all active:scale-95 ${
                    showRadar
                      ? "bg-blue-500/20 border-blue-400 text-white shadow-lg shadow-blue-500/20"
                      : "bg-slate-900/80 border-slate-800 hover:bg-slate-800/80 text-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <Compass
                      size={18}
                      className={showRadar ? "text-blue-400 animate-pulse" : "text-slate-400"}
                    />
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full uppercase ${
                        showRadar
                          ? "bg-blue-500 text-black font-extrabold"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {showRadar ? "HIỆN" : "ẨN"}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-bold">Radar La Bàn 2D</div>
                    <div className="text-[10px] text-slate-400">Định hướng góc nhìn</div>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* 3. Media & Achievement Utilities */}
          <div className="space-y-2 pt-1 border-t border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
              Tiện Ích Lưu Niệm & Thành Tích
            </span>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Snapshot Postcard Button */}
              <button
                onClick={() => {
                  onClose();
                  onOpenSnapshot();
                }}
                className="min-h-[52px] p-3 rounded-2xl bg-gradient-to-r from-cyan-600/30 to-blue-600/30 hover:from-cyan-600/40 hover:to-blue-600/40 border border-cyan-500/40 text-cyan-200 flex items-center gap-2.5 transition active:scale-95"
              >
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-300 shrink-0">
                  <Camera size={16} />
                </div>
                <div className="text-left overflow-hidden">
                  <div className="text-xs font-bold text-white truncate">Chụp Bưu Thiếp</div>
                  <div className="text-[10px] text-cyan-300/80 truncate">Tải ảnh kỷ niệm</div>
                </div>
              </button>

              {/* Badges Collection Button */}
              <button
                onClick={() => {
                  onClose();
                  onOpenBadges();
                }}
                className="min-h-[52px] p-3 rounded-2xl bg-gradient-to-r from-amber-600/30 to-yellow-600/30 hover:from-amber-600/40 hover:to-yellow-600/40 border border-amber-500/40 text-amber-200 flex items-center gap-2.5 transition active:scale-95"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300 shrink-0">
                  <Award size={16} />
                </div>
                <div className="text-left overflow-hidden">
                  <div className="text-xs font-bold text-white truncate">Kho Huy Hiệu</div>
                  <div className="text-[10px] text-amber-300/80 truncate">Bộ sưu tập danh hiệu</div>
                </div>
              </button>
            </div>
          </div>

          {/* 4. Fullscreen & Quick Navigation */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between gap-2">
              {/* Fullscreen Button */}
              <button
                onClick={onToggleFullscreen}
                className="min-h-[44px] flex-1 px-3 py-2 rounded-2xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 text-slate-300 flex items-center justify-center gap-2 transition active:scale-95 text-xs font-semibold"
              >
                {isFullscreen ? <Minimize2 size={16} className="text-cyan-400" /> : <Maximize2 size={16} className="text-slate-400" />}
                <span>{isFullscreen ? "Thu Nhỏ Màn Hình" : "Toàn Màn Hình"}</span>
              </button>

              {/* AI Chat shortcut inside drawer */}
              {onOpenChat && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenChat();
                  }}
                  className="min-h-[44px] flex-1 px-3 py-2 rounded-2xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 flex items-center justify-center gap-2 transition active:scale-95 text-xs font-semibold"
                >
                  <Sparkles size={16} />
                  <span>Trò Chuyện AI</span>
                </button>
              )}
            </div>

            {/* Quick Switch Mode (Bảo Tàng <-> Hệ Mặt Trời) */}
            {onSwitchMode && (
              <button
                onClick={() => {
                  onClose();
                  onSwitchMode();
                }}
                className="w-full min-h-[44px] px-3 py-2 rounded-2xl bg-gradient-to-r from-amber-600/30 to-orange-600/30 hover:from-amber-600/40 border border-amber-500/40 text-amber-200 flex items-center justify-center gap-2 transition active:scale-95 text-xs font-bold"
              >
                <Landmark size={15} />
                <span>{switchModeLabel || "Chuyển Sang Tham Quan Bảo Tàng"}</span>
              </button>
            )}

            {/* Back to Solar 3D Macro View */}
            {onBackToMain && !isSpaceMode && (
              <button
                onClick={() => {
                  onClose();
                  onBackToMain();
                }}
                className="w-full min-h-[44px] px-3 py-2 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center gap-2 transition active:scale-95 text-xs font-semibold"
              >
                <Orbit size={15} className="text-cyan-400" />
                <span>Quay Về Mô Hình Hệ Mặt Trời 3D</span>
              </button>
            )}
          </div>

          {/* 5. Theme Toggle & Admin Settings Strip */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Giao diện:</span>
              <ThemeToggle variant="button" />
            </div>

            <Link
              href="/admin"
              className="min-h-[44px] flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold hover:bg-slate-800 transition active:scale-95"
              onClick={onClose}
            >
              <Settings size={14} className="text-cyan-400" />
              <span>Quản Trị CMS</span>
              <ExternalLink size={12} className="opacity-60" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
