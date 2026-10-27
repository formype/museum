"use client";

import React from "react";

interface TransitionWarpEffectProps {
  isTransitioning: boolean;
  destinationName?: string;
  themeColor?: string;
}

export default function TransitionWarpEffect({
  isTransitioning,
  destinationName,
  themeColor = "#38bdf8",
}: TransitionWarpEffectProps) {
  if (!isTransitioning) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden animate-fade-in">
      {/* Dynamic Radial Tunnel Blur */}
      <div
        className="absolute inset-0 transition-all duration-700 ease-out"
        style={{
          background: `radial-gradient(circle at center, transparent 0%, rgba(2, 6, 23, 0.7) 40%, #020617 90%)`,
          backdropFilter: "blur(12px)",
        }}
      />

      {/* Warp Speed Light Streaks */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="w-48 h-48 rounded-full animate-ping [animation-duration:0.6s]"
          style={{
            background: `radial-gradient(circle, ${themeColor} 0%, transparent 70%)`,
            opacity: 0.8,
          }}
        />
        <div
          className="w-96 h-96 rounded-full animate-pulse [animation-duration:0.5s]"
          style={{
            border: `2px solid ${themeColor}`,
            boxShadow: `0 0 60px ${themeColor}, inset 0 0 40px ${themeColor}`,
          }}
        />
      </div>

      {/* Speed lines canvas/overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-40 animate-pulse" />

      {/* Destination text banner */}
      {destinationName && (
        <div className="relative z-10 px-8 py-3.5 rounded-3xl bg-slate-950/90 border border-cyan-400/50 shadow-2xl backdrop-blur-xl text-center transform animate-bounce">
          <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-cyan-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            Đang dịch chuyển không gian
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white mt-1 drop-shadow-[0_0_15px_rgba(56,189,248,0.8)]">
            {destinationName}
          </h2>
        </div>
      )}
    </div>
  );
}
