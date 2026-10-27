"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Play, Pause, SkipForward, SkipBack, X, Sparkles, CheckCircle2, RotateCcw } from "lucide-react";
import { spaceAudio } from "@/lib/audio-synth";

export interface TourStep {
  title: string;
  description: string;
  pitch: number;
  yaw: number;
  audioText?: string;
}

interface AutoTourGuideProps {
  isActive: boolean;
  onStop: () => void;
  title: string;
  steps: TourStep[];
  onNavigateToCoords: (pitch: number, yaw: number) => void;
  accentColor?: "cyan" | "amber";
}

export default function AutoTourGuide({
  isActive,
  onStop,
  title,
  steps,
  onNavigateToCoords,
  accentColor = "cyan",
}: AutoTourGuideProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  const isPlayingRef = useRef(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentIndexRef = useRef(0);
  const stepsRef = useRef<TourStep[]>(steps);

  stepsRef.current = steps;

  const clearPendingTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const executeStep = useCallback((index: number) => {
    clearPendingTimer();
    const stepList = stepsRef.current;
    if (index < 0 || index >= stepList.length) return;

    currentIndexRef.current = index;
    setCurrentStepIndex(index);
    setIsCompleted(false);

    const step = stepList[index];
    if (!step) return;

    // Smoothly turn camera to coords
    onNavigateToCoords(step.pitch, step.yaw);

    const textToRead = step.audioText || step.description || step.title;
    spaceAudio.speakNarration(textToRead, undefined, () => {
      // Callback when speech completes
      if (!isPlayingRef.current) return;

      const latestList = stepsRef.current;
      const latestIdx = currentIndexRef.current;

      if (latestIdx < latestList.length - 1) {
        // Wait 2.2s before advancing to next point
        clearPendingTimer();
        timerRef.current = setTimeout(() => {
          if (isPlayingRef.current) {
            executeStep(latestIdx + 1);
          }
        }, 2200);
      } else {
        // Finished tour, DO NOT loop! Stop cleanly and show completion
        setIsCompleted(true);
        setIsPlaying(false);
        isPlayingRef.current = false;
      }
    });
  }, [clearPendingTimer, onNavigateToCoords]);

  // Handle tour activation / deactivation
  useEffect(() => {
    if (!isActive) {
      clearPendingTimer();
      spaceAudio.stopSpeech();
      setIsPlaying(false);
      isPlayingRef.current = false;
      setIsCompleted(false);
      return;
    }

    // Start tour once
    setIsPlaying(true);
    isPlayingRef.current = true;
    setIsCompleted(false);
    executeStep(0);

    return () => {
      clearPendingTimer();
      spaceAudio.stopSpeech();
    };
  }, [isActive, clearPendingTimer, executeStep]);

  const handlePause = () => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    clearPendingTimer();
    spaceAudio.pauseSpeech();
  };

  const handleResume = () => {
    setIsPlaying(true);
    isPlayingRef.current = true;
    spaceAudio.resumeSpeech();
  };

  const handleNext = () => {
    const nextIdx = currentStepIndex + 1;
    if (nextIdx < steps.length) {
      setIsPlaying(true);
      isPlayingRef.current = true;
      executeStep(nextIdx);
    }
  };

  const handlePrev = () => {
    const prevIdx = currentStepIndex - 1;
    if (prevIdx >= 0) {
      setIsPlaying(true);
      isPlayingRef.current = true;
      executeStep(prevIdx);
    }
  };

  const handleRestart = () => {
    setIsPlaying(true);
    isPlayingRef.current = true;
    executeStep(0);
  };

  if (!isActive) return null;

  const currentStep = steps[currentStepIndex] || steps[0];
  if (!currentStep) return null;

  return (
    <div className="absolute top-20 right-4 z-40 max-w-sm w-full bg-slate-950/95 border border-cyan-500/50 rounded-3xl p-4 shadow-2xl backdrop-blur-2xl animate-slide-left select-none text-white">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
            <Sparkles size={14} className="animate-spin-slow" />
          </div>
          <div className="overflow-hidden">
            <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
              Tour Tự Động Thông Minh
            </div>
            <div className="text-xs font-bold text-white truncate">{title}</div>
          </div>
        </div>

        <button
          onClick={() => {
            clearPendingTimer();
            spaceAudio.stopSpeech();
            onStop();
          }}
          className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Thoát tour tự động"
        >
          <X size={16} />
        </button>
      </div>

      {/* Completion Banner */}
      {isCompleted ? (
        <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-2 animate-slide-up">
          <CheckCircle2 size={24} className="text-emerald-400 mx-auto" />
          <h4 className="text-xs font-bold text-emerald-200">
            Bạn Đã Hoàn Thành Toàn Bộ Lộ Trình Tour!
          </h4>
          <p className="text-[11px] text-slate-300">
            Hãy khám phá các điểm khác hoặc thử sức với bài trắc nghiệm nhận chứng chỉ nhé.
          </p>
          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              onClick={handleRestart}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold transition"
            >
              <RotateCcw size={12} /> Xem Lại
            </button>
            <button
              onClick={() => {
                clearPendingTimer();
                spaceAudio.stopSpeech();
                onStop();
              }}
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs text-white font-bold transition shadow"
            >
              Đóng Tour
            </button>
          </div>
        </div>
      ) : (
        /* Step Info Card */
        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1.5 my-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-amber-300">
            <span>
              Điểm {currentStepIndex + 1} / {steps.length}
            </span>
            <span className="font-mono text-cyan-300 text-[10px]">
              Pitch: {currentStep.pitch}° | Yaw: {currentStep.yaw}°
            </span>
          </div>
          <h4 className="text-xs sm:text-sm font-bold text-white leading-snug truncate">
            {currentStep.title}
          </h4>
          <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
            {currentStep.description}
          </p>
        </div>
      )}

      {/* Controls Bar */}
      {!isCompleted && (
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1.5">
            <button
              disabled={currentStepIndex === 0}
              onClick={handlePrev}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 transition"
              title="Điểm trước"
            >
              <SkipBack size={14} />
            </button>

            <button
              onClick={() => {
                if (isPlaying) {
                  handlePause();
                } else {
                  handleResume();
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 hover:scale-105 active:scale-95 transition"
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              <span>{isPlaying ? "Tạm Dừng" : "Tiếp Tục"}</span>
            </button>

            <button
              disabled={currentStepIndex === steps.length - 1}
              onClick={handleNext}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 transition"
              title="Điểm tiếp theo"
            >
              <SkipForward size={14} />
            </button>
          </div>

          <button
            onClick={() => {
              clearPendingTimer();
              spaceAudio.stopSpeech();
              onStop();
            }}
            className="text-xs font-semibold text-slate-400 hover:text-white px-2 py-1 rounded-lg hover:bg-slate-800 transition"
          >
            Dừng
          </button>
        </div>
      )}
    </div>
  );
}
