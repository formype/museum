"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  Orbit,
  Eye,
  BookOpen,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Maximize2,
  Minimize2,
  ZoomIn,
} from "lucide-react";
import { spaceAudio } from "@/lib/audio-synth";
import EarthObserverView from "@/components/earth-moon/EarthObserverView";
import EarthMoonQuiz from "@/components/earth-moon/EarthMoonQuiz";

const SpaceOrbitalView = dynamic(
  () => import("@/components/earth-moon/SpaceOrbitalView"),
  { ssr: false }
);

export default function EarthMoonPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"earth_observer" | "space_3d" | "quiz">("earth_observer");
  const [spaceMode, setSpaceMode] = useState<"normal" | "solar_eclipse" | "lunar_eclipse">("normal");
  const [moonAngle, setMoonAngle] = useState<number>(180);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [isPlayingNarration, setIsPlayingNarration] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Smooth orbital motion when "Tự Xoay / Tự Chạy" is active
  useEffect(() => {
    if (!autoRotate || activeTab !== "space_3d") return;
    const timer = setInterval(() => {
      setMoonAngle((prev) => (prev + 0.6) % 360);
    }, 50);
    return () => clearInterval(timer);
  }, [autoRotate, activeTab]);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current) {
          await containerRef.current.requestFullscreen();
        }
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // ignore
    }
  };

  const handleToggleNarration = () => {
    if (isPlayingNarration) {
      spaceAudio.stopSpeech();
      setIsPlayingNarration(false);
    } else {
      setIsPlayingNarration(true);
      let text = "";
      if (activeTab === "earth_observer") {
        text = "Chào mừng bạn đến với bài học hệ Mặt Trời, Trái Đất và Mặt Trăng. Khi đứng trên bề mặt Trái Đất, bạn sẽ thấy Mặt Trời mọc ở hướng Đông lúc sáng sớm, lên cao nhất lúc giữa trưa và lặn ở hướng Tây lúc chiều tà do Trái Đất tự quay quanh trục từ Tây sang Đông. Khi có nhật thực, Mặt Trăng đi qua che khuất đĩa Mặt Trời, khiến bầu trời ban ngày tối sầm lại và xuất hiện vành nhật hoa lấp lánh. Khi có nguyệt thực, Trái Đất che ánh sáng Mặt Trời, khiến Mặt Trăng chuyển sang màu đỏ đồng huyền ảo, gọi là Trăng Máu.";
      } else if (activeTab === "space_3d") {
        text = "Khi quan sát từ ngoài không gian, ta thấy rõ Mặt Trời chiếu sáng một nửa Trái Đất và Mặt Trăng, tạo nên bán cầu ban ngày và bán cầu ban đêm. Trái Đất tự quay quanh trục nghiêng 23 độ rưỡi. Khi Mặt Trăng nằm chính giữa Mặt Trời và Trái Đất, bóng tối của Mặt Trăng đổ lên Trái Đất tạo ra nhật thực. Khi Trái Đất nằm chính giữa Mặt Trời và Mặt Trăng, bóng tối của Trái Đất bao trùm Mặt Trăng tạo ra nguyệt thực.";
      } else {
        text = "Hãy hoàn thành bài tập trắc nghiệm gồm 6 câu hỏi để kiểm tra kiến thức về sự chuyển động của Mặt Trời từ Đông sang Tây, ngày và đêm trong không gian, cùng cơ chế nhật thực và nguyệt thực.";
      }

      spaceAudio.speakNarration(text, undefined, () => {
        setIsPlayingNarration(false);
      });
    }
  };

  return (
    <main
      ref={containerRef}
      className="relative w-screen h-[100dvh] overflow-hidden bg-slate-950 flex flex-col text-white select-none"
    >
      {/* Top Navigation Bar (Responsive 2 tiers on mobile, 1 tier on desktop) */}
      <header className="px-3 sm:px-6 py-2 sm:py-3 bg-slate-950/95 border-b border-slate-800 flex flex-col gap-2 shrink-0 z-30">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link
              href="/"
              onClick={() => spaceAudio.stopSpeech()}
              className="min-h-[38px] px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 flex items-center gap-1.5 text-xs font-semibold shadow transition active:scale-95 shrink-0"
            >
              <ArrowLeft size={15} />
              <span className="hidden xs:inline">Về Menu</span>
            </Link>

            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-lg sm:text-xl shrink-0">🌍</span>
              <div className="overflow-hidden">
                <h1 className="text-xs sm:text-base font-bold text-white flex items-center gap-1.5 truncate">
                  <span className="truncate">Hệ MT — Trái Đất & Mặt Trăng</span>
                  <span className="hidden md:inline-block text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/40">
                    EduTech VR
                  </span>
                </h1>
                <p className="hidden md:block text-[11px] text-slate-400 truncate">
                  Mặt Trời mọc Đông lặn Tây • Ngày & Đêm không gian • Nhật thực & Nguyệt thực
                </p>
              </div>
            </div>
          </div>

          {/* Desktop Tabs */}
          <div className="hidden md:flex items-center p-1 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-bold">
            <button
              onClick={() => {
                setActiveTab("earth_observer");
                spaceAudio.playWarpSound();
              }}
              className={`min-h-[36px] px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                activeTab === "earth_observer"
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 shadow font-extrabold"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Eye size={14} />
              <span>Góc Nhìn Trái Đất</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("space_3d");
                spaceAudio.playWarpSound();
              }}
              className={`min-h-[36px] px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                activeTab === "space_3d"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-stone-950 shadow font-extrabold"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Orbit size={14} />
              <span>Góc Nhìn Vũ Trụ 3D</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("quiz");
                spaceAudio.playWarpSound();
              }}
              className={`min-h-[36px] px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                activeTab === "quiz"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-stone-950 shadow font-extrabold"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <BookOpen size={14} />
              <span>Bài Tập KHTN</span>
            </button>
          </div>

          {/* Action Buttons: Fullscreen + Audio */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="min-h-[38px] px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
              title={isFullscreen ? "Thu nhỏ cửa sổ" : "Xem toàn màn hình"}
            >
              {isFullscreen ? <Minimize2 size={15} className="text-cyan-400" /> : <Maximize2 size={15} />}
              <span className="hidden sm:inline">
                {isFullscreen ? "Thu Nhỏ" : "Toàn Màn Hình"}
              </span>
            </button>

            {/* Audio Action Button */}
            <button
              onClick={handleToggleNarration}
              className={`min-h-[38px] px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition shrink-0 ${
                isPlayingNarration
                  ? "bg-amber-500 text-stone-950 border-amber-300 shadow-md shadow-amber-500/30 animate-pulse"
                  : "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800"
              }`}
              title="Bật/Tắt thuyết minh AI giọng đọc tự nhiên chuẩn dẫn tour"
            >
              {isPlayingNarration ? <Volume2 size={15} /> : <VolumeX size={15} />}
              <span className="hidden sm:inline">
                {isPlayingNarration ? "Dừng" : "Thuyết Minh"}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Tabs Row (shown only on mobile < md) */}
        <div className="md:hidden flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-bold w-full">
          <button
            onClick={() => {
              setActiveTab("earth_observer");
              spaceAudio.playWarpSound();
            }}
            className={`flex-1 min-h-[36px] py-1 px-1 rounded-lg transition flex items-center justify-center gap-1 ${
              activeTab === "earth_observer"
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 shadow font-extrabold"
                : "text-slate-400"
            }`}
          >
            <Eye size={13} />
            <span>Trái Đất</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("space_3d");
              spaceAudio.playWarpSound();
            }}
            className={`flex-1 min-h-[36px] py-1 px-1 rounded-lg transition flex items-center justify-center gap-1 ${
              activeTab === "space_3d"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-stone-950 shadow font-extrabold"
                : "text-slate-400"
            }`}
          >
            <Orbit size={13} />
            <span>Vũ Trụ 3D</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("quiz");
              spaceAudio.playWarpSound();
            }}
            className={`flex-1 min-h-[36px] py-1 px-1 rounded-lg transition flex items-center justify-center gap-1 ${
              activeTab === "quiz"
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-stone-950 shadow font-extrabold"
                : "text-slate-400"
            }`}
          >
            <BookOpen size={13} />
            <span>Bài Tập</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="relative flex-1 w-full overflow-hidden">
        {activeTab === "earth_observer" && (
          <EarthObserverView initialMode="sun_movement" />
        )}

        {activeTab === "space_3d" && (
          <div className="relative w-full h-full flex flex-col justify-between">
            <div className="relative flex-1 w-full">
              <SpaceOrbitalView
                mode={spaceMode}
                moonAngle={moonAngle}
                autoRotate={autoRotate}
                onSelectPreset={(p) => {
                  setSpaceMode(p);
                  if (p === "solar_eclipse") {
                    setMoonAngle(180);
                  } else if (p === "lunar_eclipse") {
                    setMoonAngle(0);
                  }
                }}
                onSelectAngle={(ang) => {
                  setMoonAngle(ang);
                  setSpaceMode("normal");
                }}
                showLabels={showLabels}
              />
            </div>

            {/* Floating Options Bar (Responsive) */}
            <div className="absolute top-2 left-2 z-20 flex flex-wrap items-center gap-1.5 pointer-events-auto max-w-[50vw] sm:max-w-none">
              <button
                onClick={() => setAutoRotate((prev) => !prev)}
                className={`min-h-[34px] px-2.5 py-1 rounded-xl border text-[11px] font-semibold backdrop-blur-md flex items-center gap-1 shadow ${
                  autoRotate
                    ? "bg-cyan-500/30 text-cyan-200 border-cyan-400"
                    : "bg-slate-900/80 text-slate-400 border-slate-700"
                }`}
              >
                {autoRotate ? <Pause size={12} /> : <Play size={12} />}
                <span>{autoRotate ? "Tự Xoay" : "Dừng"}</span>
              </button>

              <button
                onClick={() => setShowLabels((prev) => !prev)}
                className={`min-h-[34px] px-2.5 py-1 rounded-xl border text-[11px] font-semibold backdrop-blur-md flex items-center gap-1 shadow ${
                  showLabels
                    ? "bg-amber-500/30 text-amber-200 border-amber-400"
                    : "bg-slate-900/80 text-slate-400 border-slate-700"
                }`}
              >
                <span>{showLabels ? "🏷️ Nhãn" : "🏷️ Ẩn"}</span>
              </button>

              <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-700 text-[11px] text-slate-300 min-h-[34px]">
                <span className="hidden xs:inline">Góc Quỹ Đạo:</span>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={moonAngle}
                  onChange={(e) => {
                    setMoonAngle(parseFloat(e.target.value));
                    setSpaceMode("normal");
                  }}
                  className="w-16 xs:w-20 sm:w-28 accent-cyan-400 h-1.5 bg-slate-800 rounded cursor-pointer"
                />
                <span className="font-mono text-[10px] text-cyan-300 w-7">
                  {Math.round(moonAngle)}°
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "quiz" && <EarthMoonQuiz />}
      </div>
    </main>
  );
}
