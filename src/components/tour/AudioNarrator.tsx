"use client";

import React, { useState, useEffect, useRef } from "react";
import { AudioNarration } from "@/data/spaces";
import { spaceAudio } from "@/lib/audio-synth";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Subtitles,
  Sparkles,
} from "lucide-react";

interface AudioNarratorProps {
  narration: AudioNarration;
  spaceName: string;
}

export default function AudioNarrator({
  narration,
  spaceName,
}: AudioNarratorProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [activeSubtitle, setActiveSubtitle] = useState("");
  const duration = narration.durationSec || 40;

  // Auto-update subtitles based on current elapsed time
  useEffect(() => {
    if (narration.timestamps && narration.timestamps.length > 0) {
      let currentText = narration.timestamps[0].text;
      for (const item of narration.timestamps) {
        if (currentTime >= item.time) {
          currentText = item.text;
        }
      }
      setActiveSubtitle(currentText);
    } else {
      setActiveSubtitle(narration.transcript);
    }
  }, [currentTime, narration]);

  // Stop audio on unmount or space change
  useEffect(() => {
    return () => {
      spaceAudio.stopSpeech();
    };
  }, [narration]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      spaceAudio.stopSpeech();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      spaceAudio.speakNarration(
        narration.transcript,
        (progressSec) => {
          setCurrentTime(progressSec);
        },
        () => {
          setIsPlaying(false);
          setCurrentTime(0);
        }
      );
    }
  };

  const handleRestart = () => {
    spaceAudio.stopSpeech();
    setCurrentTime(0);
    setIsPlaying(true);
    spaceAudio.speakNarration(
      narration.transcript,
      (progressSec) => {
        setCurrentTime(progressSec);
      },
      () => {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    );
  };

  const progressPercent = Math.min(100, (currentTime / duration) * 100);

  return (
    <>
      {/* Floating Subtitles Overlay (bottom center) */}
      {showSubtitles && activeSubtitle && isPlaying && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-30 max-w-2xl w-[90vw] pointer-events-none transition-all duration-300 animate-fade-in">
          <div className="bg-black/85 backdrop-blur-md border border-cyan-500/40 px-6 py-3.5 rounded-2xl shadow-2xl text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">
                Thuyết minh {spaceName}
              </span>
            </div>
            <p className="text-sm md:text-base font-medium text-white leading-relaxed drop-shadow-md">
              &ldquo;{activeSubtitle}&rdquo;
            </p>
          </div>
        </div>
      )}

      {/* Floating Audio Control Player Bar (Top center, positioned safely below top bar) */}
      <div className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-25 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-2xl text-white max-w-[92vw] sm:max-w-md transition-all">
        {/* Play/Pause Button */}
        <button
          onClick={handleTogglePlay}
          className={`min-h-[40px] min-w-[40px] p-2 sm:p-2.5 rounded-xl transition-all shadow-md flex items-center justify-center shrink-0 ${
            isPlaying
              ? "bg-amber-500 text-white shadow-amber-500/40 animate-pulse"
              : "bg-cyan-500 text-white hover:bg-cyan-400 shadow-cyan-500/40 hover:scale-105 active:scale-95"
          }`}
          title={isPlaying ? "Tạm dừng thuyết minh" : "Nghe thuyết minh"}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} className="translate-x-0.5" />}
        </button>

        {/* Audio Meta and Progress */}
        <div className="flex flex-col min-w-[120px] xs:min-w-[160px] sm:min-w-[200px] flex-1">
          <div className="flex items-center justify-between text-xs font-semibold mb-1">
            <span className="text-cyan-300 truncate max-w-[110px] xs:max-w-[140px] sm:max-w-[180px]">
              {narration.speaker}
            </span>
            <span className="text-[10px] sm:text-[11px] font-mono text-slate-400">
              {Math.floor(currentTime)}s / {duration}s
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-200"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Sound waves visualization */}
        {isPlaying && (
          <div className="hidden sm:flex items-center gap-0.5 h-4 shrink-0">
            <span className="w-1 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.1s] h-3" />
            <span className="w-1 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.3s] h-5" />
            <span className="w-1 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.2s] h-4" />
            <span className="w-1 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.4s] h-2" />
          </div>
        )}

        {/* Restart button */}
        <button
          onClick={handleRestart}
          title="Nghe lại từ đầu"
          className="min-h-[36px] min-w-[36px] p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center justify-center shrink-0 active:scale-95"
        >
          <RotateCcw size={15} />
        </button>

        {/* Subtitle toggle */}
        <button
          onClick={() => setShowSubtitles((prev) => !prev)}
          title="Bật/Tắt Phụ đề"
          className={`min-h-[36px] min-w-[36px] p-2 rounded-xl transition flex items-center justify-center shrink-0 active:scale-95 ${
            showSubtitles
              ? "text-cyan-400 bg-cyan-500/20"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <Subtitles size={15} />
        </button>
      </div>
    </>
  );
}
