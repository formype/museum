"use client";

import React, { useState } from "react";
import { Compass, MapPin, Navigation, Eye, Layers, ChevronUp, ChevronDown, X } from "lucide-react";

interface MiniMapRadarProps {
  currentYaw: number;
  currentPitch: number;
  currentTitle: string;
  items: { id: string; name: string; pitch?: number; yaw?: number; emoji?: string }[];
  onSelectItem?: (id: string) => void;
  accentColor?: "cyan" | "amber";
  className?: string;
  onClose?: () => void;
}

export default function MiniMapRadar({
  currentYaw,
  currentPitch,
  currentTitle,
  items,
  onSelectItem,
  accentColor = "cyan",
  className,
  onClose,
}: MiniMapRadarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isAmber = accentColor === "amber";

  // Calculate radar needle angle (normalized 0 to 360)
  const normalizedYaw = ((currentYaw % 360) + 360) % 360;

  return (
    <div
      className={
        className ||
        "fixed top-18 sm:top-20 left-3 sm:left-6 z-25 flex flex-col items-start gap-2 select-none pointer-events-auto"
      }
    >
      <div className="relative group">
        {/* Main Radar Disc */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full backdrop-blur-xl border-2 shadow-2xl cursor-pointer transition-all hover:scale-105 active:scale-95 flex items-center justify-center ${
            isAmber
              ? "bg-stone-950/90 border-amber-500/50 shadow-amber-500/10"
              : "bg-slate-950/90 border-cyan-500/50 shadow-cyan-500/10"
          }`}
          title="Nhấn để mở danh sách điểm đến trên Radar"
        >
          {/* Radar concentric rings */}
          <div className="absolute inset-1.5 sm:inset-2 rounded-full border border-dashed border-slate-700/60 pointer-events-none" />
          <div className="absolute inset-4 sm:inset-6 rounded-full border border-slate-800/80 pointer-events-none" />

          {/* Crosshair Axes */}
          <div className="absolute w-full h-[1px] bg-slate-700/40 pointer-events-none" />
          <div className="absolute h-full w-[1px] bg-slate-700/40 pointer-events-none" />

          {/* Cardinal Directions */}
          <span className="absolute top-1 text-[8px] sm:text-[9px] font-bold text-red-400 font-mono">B</span>
          <span className="absolute bottom-1 text-[8px] sm:text-[9px] font-bold text-slate-400 font-mono">N</span>
          <span className="absolute left-1 text-[8px] sm:text-[9px] font-bold text-slate-400 font-mono">T</span>
          <span className="absolute right-1 text-[8px] sm:text-[9px] font-bold text-slate-400 font-mono">Đ</span>

          {/* Dynamic FOV Vision Cone & Pointer */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-100"
            style={{ transform: `rotate(${normalizedYaw}deg)` }}
          >
            {/* FOV Cone light beam */}
            <div
              className={`w-0 h-0 border-l-[14px] sm:border-l-[18px] border-l-transparent border-r-[14px] sm:border-r-[18px] border-r-transparent border-t-[36px] sm:border-t-[44px] opacity-40 absolute -top-1 ${
                isAmber ? "border-t-amber-400" : "border-t-cyan-400"
              }`}
            />
            {/* Compass arrow */}
            <Navigation
              size={15}
              className={`rotate-45 drop-shadow-md ${
                isAmber ? "text-amber-400 fill-amber-400" : "text-cyan-400 fill-cyan-400"
              }`}
            />
          </div>

          {/* Markers on radar */}
          {items.slice(0, 8).map((m, idx) => {
            const itemYaw = ((m.yaw || idx * 45) + 360) % 360;
            const rad = (itemYaw * Math.PI) / 180;
            const dist = 28; // radius
            const x = dist * Math.sin(rad);
            const y = -dist * Math.cos(rad);

            return (
              <div
                key={`radar-m-${idx}`}
                className="absolute w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-yellow-400 border border-white shadow animate-pulse"
                style={{
                  transform: `translate(${x}px, ${y}px)`,
                }}
                title={m.name}
              />
            );
          })}

          {/* Angle degree badge below radar */}
          <div className="absolute -bottom-2 px-1.5 sm:px-2 py-0.5 rounded-full bg-slate-900/90 border border-slate-700 text-[8px] sm:text-[9px] font-mono text-cyan-300 font-bold whitespace-nowrap shadow">
            {Math.round(normalizedYaw)}°
          </div>
        </div>

        {/* Close button if provided */}
        {onClose && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-slate-900/95 border border-slate-700 text-slate-300 hover:text-white hover:bg-red-500/80 transition flex items-center justify-center shadow-md active:scale-90"
            title="Ẩn Radar"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Expanded Quick Navigation List */}
      {isExpanded && (
        <div className="w-52 sm:w-56 p-2.5 rounded-2xl bg-slate-950/95 border border-slate-700/80 backdrop-blur-xl shadow-2xl animate-slide-up space-y-1.5">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-0.5 flex items-center justify-between">
            <span>Điểm Khám Phá</span>
            <Layers size={12} className={isAmber ? "text-amber-400" : "text-cyan-400"} />
          </div>

          <div className="max-h-44 overflow-y-auto space-y-1 pr-1 no-scrollbar">
            {items.map((it) => (
              <button
                key={`nav-mini-${it.id}`}
                onClick={() => {
                  if (onSelectItem) onSelectItem(it.id);
                  setIsExpanded(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-xl bg-slate-900/80 text-slate-200 hover:text-white border border-slate-800 text-xs flex items-center gap-2 transition min-h-[36px] ${
                  isAmber ? "hover:bg-amber-600/30" : "hover:bg-cyan-600/30"
                }`}
              >
                <span>{it.emoji || "📍"}</span>
                <span className="truncate flex-1 font-medium">{it.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
