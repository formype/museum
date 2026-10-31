"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sun,
  Moon,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Clock,
  Eye,
} from "lucide-react";

export type ObserverMode = "sun_movement" | "solar_eclipse_view" | "lunar_eclipse_view";

interface EarthObserverViewProps {
  initialMode?: ObserverMode;
}

export default function EarthObserverView({
  initialMode = "sun_movement",
}: EarthObserverViewProps) {
  const [activeMode, setActiveMode] = useState<ObserverMode>(initialMode);

  // Mode 1: Daily Sun Movement (Hours: 0 to 24)
  const [timeOfDay, setTimeOfDay] = useState<number>(10); // default 10:00 AM
  const [isPlayingSun, setIsPlayingSun] = useState<boolean>(false);

  // Mode 2: Solar Eclipse from Earth (0% to 100% totality)
  const [solarEclipseProgress, setSolarEclipseProgress] = useState<number>(0);
  const [isPlayingSolar, setIsPlayingSolar] = useState<boolean>(false);

  // Mode 3: Lunar Eclipse from Earth (0% to 100% totality)
  const [lunarEclipseProgress, setLunarEclipseProgress] = useState<number>(0);
  const [isPlayingLunar, setIsPlayingLunar] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Animation Loop for Time of Day
  useEffect(() => {
    if (isPlayingSun && activeMode === "sun_movement") {
      timerRef.current = setInterval(() => {
        setTimeOfDay((prev) => {
          const next = prev + 0.1;
          return next >= 24 ? 0 : next;
        });
      }, 70);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlayingSun, activeMode]);

  // Animation Loop for Solar Eclipse
  useEffect(() => {
    if (isPlayingSolar && activeMode === "solar_eclipse_view") {
      timerRef.current = setInterval(() => {
        setSolarEclipseProgress((prev) => {
          if (prev >= 100) {
            setIsPlayingSolar(false);
            return 100;
          }
          return Math.min(100, prev + 1.2);
        });
      }, 80);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlayingSolar, activeMode]);

  // Animation Loop for Lunar Eclipse
  useEffect(() => {
    if (isPlayingLunar && activeMode === "lunar_eclipse_view") {
      timerRef.current = setInterval(() => {
        setLunarEclipseProgress((prev) => {
          if (prev >= 100) {
            setIsPlayingLunar(false);
            return 100;
          }
          return Math.min(100, prev + 1.2);
        });
      }, 80);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlayingLunar, activeMode]);

  // Format hours to string (e.g., 14.5 -> "14:30")
  const formatTime = (hoursVal: number) => {
    const h = Math.floor(hoursVal);
    const m = Math.floor((hoursVal - h) * 60);
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  // Helper calculation for Sun position across the sky:
  const isDaytime = timeOfDay >= 5.5 && timeOfDay <= 18.5;
  const daylightFraction = Math.max(0, Math.min(1, (timeOfDay - 5.5) / 13));

  // Calculate Sun XY percentage in the sky dome
  const sunX = 12 + daylightFraction * 76;
  const sunElevation = Math.sin(daylightFraction * Math.PI);
  const sunY = 80 - sunElevation * 60;

  // Sky gradient based on time
  const getSkyGradient = () => {
    if (!isDaytime) {
      return "from-slate-950 via-indigo-950 to-slate-900"; // Night
    }
    if (timeOfDay < 7) {
      return "from-amber-950 via-rose-950 to-orange-900"; // Dawn / Sunrise
    }
    if (timeOfDay > 17) {
      return "from-purple-950 via-rose-900 to-amber-900"; // Sunset / Dusk
    }
    return "from-sky-500 via-sky-300 to-blue-200"; // Bright Day
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between bg-slate-950 text-white select-none overflow-hidden">
      {/* Top Navigation Tabs (Responsive on Mobile) */}
      <div className="relative z-20 p-1.5 sm:p-2.5 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        <div className="flex items-center gap-1 sm:gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => {
              setActiveMode("sun_movement");
              setIsPlayingSun(false);
              setIsPlayingSolar(false);
              setIsPlayingLunar(false);
            }}
            className={`min-h-[36px] sm:min-h-[38px] px-2.5 sm:px-3 py-1 rounded-xl text-[11px] sm:text-xs font-bold transition flex items-center justify-center gap-1 border shrink-0 ${
              activeMode === "sun_movement"
                ? "bg-amber-500 text-stone-950 border-amber-300 shadow-md shadow-amber-500/30"
                : "bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700"
            }`}
          >
            <Sun size={14} />
            <span>Đông ➔ Tây</span>
          </button>

          <button
            onClick={() => {
              setActiveMode("solar_eclipse_view");
              setIsPlayingSun(false);
              setIsPlayingSolar(false);
              setIsPlayingLunar(false);
            }}
            className={`min-h-[36px] sm:min-h-[38px] px-2.5 sm:px-3 py-1 rounded-xl text-[11px] sm:text-xs font-bold transition flex items-center justify-center gap-1 border shrink-0 ${
              activeMode === "solar_eclipse_view"
                ? "bg-cyan-500 text-stone-950 border-cyan-300 shadow-md shadow-cyan-500/30"
                : "bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700"
            }`}
          >
            <Sparkles size={14} />
            <span>Nhật Thực TĐ</span>
          </button>

          <button
            onClick={() => {
              setActiveMode("lunar_eclipse_view");
              setIsPlayingSun(false);
              setIsPlayingSolar(false);
              setIsPlayingLunar(false);
            }}
            className={`min-h-[36px] sm:min-h-[38px] px-2.5 sm:px-3 py-1 rounded-xl text-[11px] sm:text-xs font-bold transition flex items-center justify-center gap-1 border shrink-0 ${
              activeMode === "lunar_eclipse_view"
                ? "bg-rose-500 text-white border-rose-300 shadow-md shadow-rose-500/30"
                : "bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700"
            }`}
          >
            <Moon size={14} />
            <span>Nguyệt Thực TĐ</span>
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-950/60 px-3 py-1 rounded-xl border border-slate-800 shrink-0">
          <Eye size={13} className="text-cyan-400" />
          <span>Góc Nhìn Thực Tế Từ Mặt Đất</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SCENARIO 1: MẶT TRỜI MỌC ĐÔNG - LẶN TÂY (GROUND OBSERVER VIEW)             */}
      {/* ========================================================================= */}
      {activeMode === "sun_movement" && (
        <div className="relative flex-1 w-full flex flex-col justify-between overflow-hidden">
          {/* Sky Canvas / Dome */}
          <div className={`relative flex-1 w-full bg-gradient-to-b transition-colors duration-500 overflow-hidden ${getSkyGradient()}`}>
            {/* Stars visible during night or dawn/dusk */}
            {!isDaytime && (
              <div className="absolute inset-0 opacity-80 pointer-events-none">
                <div className="w-full h-full bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />
              </div>
            )}

            {/* Sun Trajectory Arc (Dashed Line across sky) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
              <defs>
                <linearGradient id="sunArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#f59e0b" stopOpacity="1" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.8" />
                </linearGradient>
              </defs>
              <path
                d="M 12% 80% Q 50% 14%, 88% 80%"
                fill="none"
                stroke="url(#sunArcGrad)"
                strokeWidth="2.5"
                strokeDasharray="5 5"
                className="drop-shadow-lg"
              />
              <text x="50%" y="16%" fill="#fef08a" fontSize="10" textAnchor="middle" fontWeight="bold">
                ▲ Quỹ Đạo Biểu Kiến: ĐÔNG ➔ TÂY
              </text>
            </svg>

            {/* The Sun Mesh / Marker */}
            {isDaytime ? (
              <div
                className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-100 flex flex-col items-center pointer-events-none"
                style={{ left: `${sunX}%`, top: `${sunY}%` }}
              >
                {/* Sun Glow Corona */}
                <div className="relative flex items-center justify-center">
                  <div className="w-12 h-12 xs:w-16 xs:h-16 rounded-full bg-amber-400/40 blur-lg animate-pulse absolute" />
                  <div className="w-8 h-8 xs:w-12 xs:h-12 rounded-full bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 shadow-xl shadow-amber-400 border border-yellow-100 flex items-center justify-center">
                    <Sun className="w-5 h-5 xs:w-7 xs:h-7 text-amber-700 animate-spin-slow" />
                  </div>
                </div>
                <span className="mt-1 text-[9px] xs:text-[10px] font-bold text-amber-200 bg-slate-950/80 px-2 py-0.5 rounded-full border border-amber-400/40 shadow whitespace-nowrap">
                  Mặt Trời ({formatTime(timeOfDay)})
                </span>
              </div>
            ) : (
              /* Night Time: Sun is below the horizon, Moon is up */
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
                <div className="w-10 h-10 xs:w-12 xs:h-12 rounded-full bg-slate-100 shadow-[0_0_20px_rgba(255,255,255,0.7)] flex items-center justify-center border border-white">
                  <Moon className="w-6 h-6 text-slate-800" />
                </div>
                <span className="mt-1.5 text-[10px] xs:text-xs font-semibold text-slate-300 bg-slate-900/80 px-2 py-0.5 rounded-full border border-slate-700">
                  Ban Đêm (Mặt Trời lặn)
                </span>
              </div>
            )}

            {/* Ground Horizon (Green Hills & Observer Base) */}
            <div className="absolute bottom-0 inset-x-0 h-20 xs:h-24 sm:h-32 bg-gradient-to-t from-emerald-950 via-emerald-900 to-emerald-800 border-t-2 border-emerald-500/40 flex flex-col justify-between p-2 sm:p-3 shadow-2xl">
              {/* Compass Cardinal Points on Horizon */}
              <div className="w-full flex items-center justify-between text-[11px] xs:text-xs sm:text-sm font-black px-1 sm:px-4 pt-0.5">
                {/* EAST */}
                <div className="flex flex-col items-center bg-slate-950/90 px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg border border-amber-400 shadow text-amber-400">
                  <span>ĐÔNG (E)</span>
                  <span className="text-[9px] font-mono text-slate-300 font-normal hidden xs:inline">Mọc (~6h)</span>
                </div>

                {/* SOUTH / ZENITH */}
                <div className="flex flex-col items-center bg-slate-950/90 px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg border border-cyan-400 shadow text-cyan-400">
                  <span>NAM (Đỉnh)</span>
                  <span className="text-[9px] font-mono text-slate-300 font-normal hidden xs:inline">Trưa (~12h)</span>
                </div>

                {/* WEST */}
                <div className="flex flex-col items-center bg-slate-950/90 px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg border border-red-400 shadow text-red-400">
                  <span>TÂY (W)</span>
                  <span className="text-[9px] font-mono text-slate-300 font-normal hidden xs:inline">Lặn (~18h)</span>
                </div>
              </div>

              {/* Observer Silhouette in the Center */}
              <div className="flex items-center justify-center gap-1.5 pb-0.5">
                <div className="bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-700 flex items-center gap-1.5 text-[10px] xs:text-xs text-slate-200 shadow">
                  <span>🧑‍🚀</span>
                  <span className="truncate">Người quan sát trên Trái Đất</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Control Bar for Time Slider */}
          <div className="p-2 sm:p-3.5 bg-slate-900/95 border-t border-slate-800 space-y-1.5 sm:space-y-2 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsPlayingSun((prev) => !prev)}
                  className="min-h-[38px] px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-stone-950 font-bold text-xs flex items-center gap-1 shadow active:scale-95 transition"
                >
                  {isPlayingSun ? <Pause size={13} /> : <Play size={13} />}
                  <span>{isPlayingSun ? "Tạm Dừng" : "Chạy"}</span>
                </button>

                <button
                  onClick={() => {
                    setTimeOfDay(12);
                    setIsPlayingSun(false);
                  }}
                  className="min-h-[38px] px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 border border-slate-700"
                  title="Đặt lại 12:00 Trưa"
                >
                  <RotateCcw size={12} />
                  <span>12:00</span>
                </button>
              </div>

              {/* Time readout display */}
              <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-amber-500/40 text-amber-300 font-mono text-xs sm:text-sm font-bold shadow-inner">
                <Clock size={14} />
                <span>{formatTime(timeOfDay)}</span>
                <span className="text-[10px] text-slate-400 font-sans font-normal hidden xs:inline">
                  ({timeOfDay >= 6 && timeOfDay < 12 ? "Sáng" : timeOfDay >= 12 && timeOfDay < 18 ? "Chiều" : "Đêm"})
                </span>
              </div>
            </div>

            {/* Range Slider for 24 hours */}
            <div className="flex items-center gap-2 pt-0.5">
              <span className="text-[10px] font-mono text-slate-400 shrink-0">00h</span>
              <input
                type="range"
                min="0"
                max="24"
                step="0.1"
                value={timeOfDay}
                onChange={(e) => {
                  setTimeOfDay(parseFloat(e.target.value));
                  setIsPlayingSun(false);
                }}
                className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] font-mono text-slate-400 shrink-0">24h</span>
            </div>

            {/* Explanation box */}
            <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/30 text-[10px] sm:text-xs text-amber-200/90 leading-tight">
              💡 <strong>Quy luật:</strong> Trái Đất tự quay từ <strong>TÂY sang ĐÔNG</strong> nên ta thấy Mặt Trời di chuyển từ <strong>ĐÔNG sang TÂY</strong>!
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCENARIO 2: QUAN SÁT NHẬT THỰC TỪ TRÁI ĐẤT (SOLAR ECLIPSE FROM EARTH)     */}
      {/* ========================================================================= */}
      {activeMode === "solar_eclipse_view" && (
        <div className="relative flex-1 w-full flex flex-col justify-between overflow-hidden">
          {/* Dynamic Sky based on Eclipse Progress (Totality = Darkness in Daytime) */}
          <div
            className="relative flex-1 w-full flex flex-col items-center justify-center p-2 sm:p-4 transition-colors duration-700 overflow-hidden"
            style={{
              backgroundColor:
                solarEclipseProgress > 85
                  ? `rgba(5, 7, 18, ${0.4 + (solarEclipseProgress / 100) * 0.6})`
                  : solarEclipseProgress > 40
                  ? `rgba(15, 30, 60, ${0.4 + (solarEclipseProgress / 100) * 0.5})`
                  : "#0284c7",
            }}
          >
            {/* Stars appear when Totality is reached (over 85%) */}
            {solarEclipseProgress > 80 && (
              <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-700"
                style={{ opacity: (solarEclipseProgress - 80) / 20 }}
              >
                <div className="w-full h-full bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:28px_28px] animate-pulse" />
                <div className="absolute top-2 right-2 xs:top-4 xs:right-4 flex items-center gap-1 bg-slate-900/85 px-2 py-0.5 rounded-full border border-cyan-400/50 text-[9px] xs:text-[10px] text-cyan-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-ping" />
                  Sao Kim (Venus) hiện rõ giữa ban trưa!
                </div>
              </div>
            )}

            {/* Sun & Moon Overlap Simulation (Responsive Sizing) */}
            <div className="relative w-36 h-36 xs:w-48 xs:h-48 sm:w-64 sm:h-64 flex items-center justify-center select-none my-auto">
              {/* Solar Corona Glow */}
              {solarEclipseProgress > 70 && (
                <div
                  className="absolute inset-0 rounded-full blur-xl sm:blur-2xl transition-all duration-500 animate-pulse"
                  style={{
                    background:
                      solarEclipseProgress >= 96
                        ? "radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(200,230,255,0.6) 40%, rgba(255,180,50,0.2) 75%, transparent 100%)"
                        : "radial-gradient(circle, rgba(255,200,80,0.4) 0%, transparent 70%)",
                    transform: `scale(${1 + (solarEclipseProgress / 100) * 0.5})`,
                  }}
                />
              )}

              {/* Diamond Ring Flash Effect */}
              {solarEclipseProgress >= 93 && solarEclipseProgress <= 98 && (
                <div className="absolute -top-1 right-8 xs:right-10 z-20 w-6 h-6 xs:w-8 xs:h-8 rounded-full bg-white shadow-[0_0_30px_10px_rgba(255,255,255,1)] animate-ping" />
              )}

              {/* BASE: Sun Sphere */}
              <div className="relative w-28 h-28 xs:w-36 xs:h-36 sm:w-48 sm:h-48 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 shadow-[0_0_40px_rgba(251,191,36,0.9)] flex items-center justify-center overflow-hidden border border-yellow-200">
                {solarEclipseProgress < 95 && (
                  <Sun className="w-14 h-14 xs:w-20 xs:h-20 text-amber-600/30 animate-spin-slow" />
                )}
              </div>

              {/* OVERLAY: Moon Disc sliding across the Sun */}
              <div
                className="absolute w-28 h-28 xs:w-36 xs:h-36 sm:w-48 sm:h-48 rounded-full bg-slate-950 shadow-2xl transition-all duration-75 border border-slate-800"
                style={{
                  transform: `translateX(${(1 - solarEclipseProgress / 100) * 110}%)`,
                }}
              />
            </div>

            {/* Stage Tag */}
            <div className="flex flex-col items-center gap-1 z-10 shrink-0">
              <span className={`px-2.5 sm:px-3 py-1 rounded-xl text-[10px] xs:text-xs font-black uppercase tracking-wider border shadow-md ${
                solarEclipseProgress >= 96
                  ? "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white border-cyan-300 animate-pulse"
                  : solarEclipseProgress > 0
                  ? "bg-amber-500 text-stone-950 border-amber-300"
                  : "bg-slate-900/90 text-slate-300 border-slate-700"
              }`}>
                {solarEclipseProgress >= 96
                  ? "✨ NHẬT THỰC TOÀN PHẦN (VÀNH NHẬT HOA)"
                  : solarEclipseProgress >= 93
                  ? "💍 VÒNG KIM CƯƠNG (DIAMOND RING)"
                  : solarEclipseProgress > 0
                  ? `🌓 NHẬT THỰC MỘT PHẦN (${Math.round(solarEclipseProgress)}%)`
                  : "☀️ MẶT TRỜI CHƯA BỊ CHE"}
              </span>

              <p className="text-[10px] xs:text-xs text-center max-w-sm sm:max-w-md text-slate-200 px-2 py-0.5 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-800 line-clamp-2">
                {solarEclipseProgress >= 96
                  ? "Trời tối sầm giữa ban trưa! Mặt Trăng che khít Mặt Trời, hiện vành nhật hoa lấp lánh và sao trên trời."
                  : solarEclipseProgress > 0
                  ? "Mặt Trăng đi qua trước Mặt Trời, cắn khuyết đĩa sáng như hình lưỡi liềm. Ánh sáng mờ dần."
                  : "Bầu trời ban ngày trong xanh, đĩa Mặt Trời chiếu sáng chói chang."}
              </p>
            </div>
          </div>

          {/* Controls for Solar Eclipse */}
          <div className="p-2 sm:p-3.5 bg-slate-900/95 border-t border-slate-800 space-y-1.5 sm:space-y-2 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsPlayingSolar((prev) => !prev)}
                  className="min-h-[38px] px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-stone-950 font-bold text-xs flex items-center gap-1 shadow active:scale-95 transition"
                >
                  {isPlayingSolar ? <Pause size={13} /> : <Play size={13} />}
                  <span>{isPlayingSolar ? "Dừng" : "Mô Phỏng"}</span>
                </button>

                <button
                  onClick={() => {
                    setSolarEclipseProgress(100);
                    setIsPlayingSolar(false);
                  }}
                  className="min-h-[38px] px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold flex items-center gap-1 border border-cyan-500/40"
                >
                  <Sparkles size={12} />
                  <span>100%</span>
                </button>

                <button
                  onClick={() => {
                    setSolarEclipseProgress(0);
                    setIsPlayingSolar(false);
                  }}
                  className="min-h-[38px] px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 border border-slate-700"
                >
                  <RotateCcw size={12} />
                  <span>0%</span>
                </button>
              </div>

              {/* Progress Readout */}
              <div className="bg-slate-950 px-2.5 py-1 rounded-xl border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold shadow-inner">
                Tiến trình: {Math.round(solarEclipseProgress)}%
              </div>
            </div>

            {/* Range Slider */}
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={solarEclipseProgress}
              onChange={(e) => {
                setSolarEclipseProgress(parseFloat(e.target.value));
                setIsPlayingSolar(false);
              }}
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />

            <div className="p-1.5 xs:p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-[10px] text-cyan-200/90 leading-tight">
              ⚠️ <strong>An toàn:</strong> Khi quan sát ngoài đời, <strong>không nhìn trực tiếp vào Mặt Trời</strong> mà phải dùng kính quan sát nhật thực chuẩn ISO 12312-2!
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCENARIO 3: QUAN SÁT NGUYỆT THỰC TỪ TRÁI ĐẤT (LUNAR ECLIPSE FROM EARTH)    */}
      {/* ========================================================================= */}
      {activeMode === "lunar_eclipse_view" && (
        <div className="relative flex-1 w-full flex flex-col justify-between overflow-hidden">
          {/* Night Sky with Stars */}
          <div className="relative flex-1 w-full flex flex-col items-center justify-center p-2 sm:p-4 bg-slate-950 overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-85">
              <div className="w-full h-full bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />
            </div>

            {/* Moon & Earth Shadow Overlap Simulation */}
            <div className="relative w-36 h-36 xs:w-48 xs:h-48 sm:w-64 sm:h-64 flex items-center justify-center select-none my-auto">
              {/* Blood Moon Aura Glow */}
              {lunarEclipseProgress > 60 && (
                <div
                  className="absolute inset-0 rounded-full blur-xl sm:blur-2xl transition-all duration-500"
                  style={{
                    backgroundColor: "rgba(220, 38, 38, 0.45)",
                    transform: `scale(${1 + (lunarEclipseProgress / 100) * 0.3})`,
                  }}
                />
              )}

              {/* The Moon Sphere */}
              <div
                className="relative w-28 h-28 xs:w-36 xs:h-36 sm:w-48 sm:h-48 rounded-full flex items-center justify-center overflow-hidden border transition-all duration-300 shadow-2xl"
                style={{
                  backgroundColor:
                    lunarEclipseProgress >= 90
                      ? "#991b1b"
                      : lunarEclipseProgress > 40
                      ? "#78350f"
                      : "#e2e8f0",
                  borderColor:
                    lunarEclipseProgress >= 90 ? "#ef4444" : "#cbd5e1",
                  boxShadow:
                    lunarEclipseProgress >= 90
                      ? "0 0 35px rgba(239, 68, 68, 0.6)"
                      : "0 0 25px rgba(255, 255, 255, 0.5)",
                }}
              >
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_30%_30%,#334155_2px,transparent_8px)] [background-size:24px_24px]" />

                {lunarEclipseProgress < 90 && (
                  <div
                    className="absolute inset-0 rounded-full bg-slate-950/90 transition-all duration-100"
                    style={{
                      transform: `translateX(${(1 - lunarEclipseProgress / 90) * 105}%)`,
                    }}
                  />
                )}
              </div>
            </div>

            {/* Stage Description Badge */}
            <div className="flex flex-col items-center gap-1 z-10 shrink-0">
              <span className={`px-2.5 sm:px-3 py-1 rounded-xl text-[10px] xs:text-xs font-black uppercase tracking-wider border shadow-md ${
                lunarEclipseProgress >= 90
                  ? "bg-gradient-to-r from-red-600 via-rose-600 to-amber-700 text-white border-red-400 animate-pulse"
                  : lunarEclipseProgress > 0
                  ? "bg-rose-950 text-rose-300 border-rose-500"
                  : "bg-slate-900/90 text-slate-300 border-slate-700"
              }`}>
                {lunarEclipseProgress >= 90
                  ? "🔴 NGUYỆT THỰC TOÀN PHẦN (TRĂNG MÁU)"
                  : lunarEclipseProgress > 0
                  ? `🌗 NGUYỆT THỰC MỘT PHẦN (${Math.round(lunarEclipseProgress)}%)`
                  : "🌕 TRĂNG RẰM SÁNG TRÒN"}
              </span>

              <p className="text-[10px] xs:text-xs text-center max-w-sm sm:max-w-md text-slate-200 px-2 py-0.5 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-800 line-clamp-2">
                {lunarEclipseProgress >= 90
                  ? "Mặt Trăng chuyển sang màu đỏ đồng huyền ảo do hiện tượng tán xạ Rayleigh qua bầu khí quyển Trái Đất."
                  : lunarEclipseProgress > 0
                  ? "Bóng tròn của Trái Đất che dần đĩa Mặt Trăng — bằng chứng lịch sử chứng minh Trái Đất hình cầu."
                  : "Bầu trời đêm trăng tròn vành vạnh chiếu sáng khắp nhân gian."}
              </p>
            </div>
          </div>

          {/* Controls for Lunar Eclipse */}
          <div className="p-2 sm:p-3.5 bg-slate-900/95 border-t border-slate-800 space-y-1.5 sm:space-y-2 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsPlayingLunar((prev) => !prev)}
                  className="min-h-[38px] px-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs flex items-center gap-1 shadow active:scale-95 transition"
                >
                  {isPlayingLunar ? <Pause size={13} /> : <Play size={13} />}
                  <span>{isPlayingLunar ? "Dừng" : "Mô Phỏng"}</span>
                </button>

                <button
                  onClick={() => {
                    setLunarEclipseProgress(100);
                    setIsPlayingLunar(false);
                  }}
                  className="min-h-[38px] px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-red-300 text-xs font-semibold flex items-center gap-1 border border-red-500/40"
                >
                  <Moon size={12} />
                  <span>Trăng Máu</span>
                </button>

                <button
                  onClick={() => {
                    setLunarEclipseProgress(0);
                    setIsPlayingLunar(false);
                  }}
                  className="min-h-[38px] px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 border border-slate-700"
                >
                  <RotateCcw size={12} />
                  <span>0%</span>
                </button>
              </div>

              {/* Progress Readout */}
              <div className="bg-slate-950 px-2.5 py-1 rounded-xl border border-red-500/40 text-red-300 font-mono text-xs font-bold shadow-inner">
                Tiến trình: {Math.round(lunarEclipseProgress)}%
              </div>
            </div>

            {/* Range Slider */}
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={lunarEclipseProgress}
              onChange={(e) => {
                setLunarEclipseProgress(parseFloat(e.target.value));
                setIsPlayingLunar(false);
              }}
              className="w-full accent-rose-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />

            <div className="p-1.5 xs:p-2 rounded-xl bg-rose-950/40 border border-rose-500/30 text-[10px] text-rose-200/90 leading-tight">
              🔭 <strong>Quan sát:</strong> Nguyệt thực hoàn toàn an toàn khi nhìn bằng mắt thường hoặc ống nhòm không cần kính lọc bảo vệ!
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
