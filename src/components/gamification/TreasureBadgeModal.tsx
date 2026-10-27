"use client";

import React from "react";
import { Award, Trophy, Star, CheckCircle, Lock, X, Sparkles } from "lucide-react";

export interface BadgeItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "space" | "museum" | "quiz";
  isUnlocked: boolean;
}

interface TreasureBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  unlockedBadgeIds?: string[];
}

const ALL_BADGES: BadgeItem[] = [
  {
    id: "badge-sun",
    name: "Hào Quang Thái Dương",
    description: "Khám phá tâm lõi nhiệt hạch 15 triệu độ C của Mặt Trời",
    icon: "☀️",
    category: "space",
    isUnlocked: true,
  },
  {
    id: "badge-mars",
    name: "Dấu Chân Hành Tinh Đỏ",
    description: "Định vị miệng núi lửa Olympus Mons cao 22km trên Sao Hỏa",
    icon: "🔴",
    category: "space",
    isUnlocked: true,
  },
  {
    id: "badge-iss",
    name: "Phi Hành Gia Quỹ Đạo",
    description: "Ngắm Trái Đất từ khoang kính vòm Cupola trên trạm ISS",
    icon: "🛰️",
    category: "space",
    isUnlocked: true,
  },
  {
    id: "badge-drum",
    name: "Hồn Thiêng Trống Đồng",
    description: "Tìm hiểu hoa văn thần Mặt Trời trên Trống Đồng Đông Sơn",
    icon: "🥁",
    category: "museum",
    isUnlocked: true,
  },
  {
    id: "badge-mic-1945",
    name: "Âm Vang Ba Đình",
    description: "Lắng nghe câu chuyện chiếc micro lịch sử ngày 2/9/1945",
    icon: "🎙️",
    category: "museum",
    isUnlocked: true,
  },
  {
    id: "badge-quiz-master",
    name: "Bậc Thầy Trí Tuệ",
    description: "Hoàn thành xuất sắc bài thi trắc nghiệm kiến thức và nhận chứng chỉ",
    icon: "🏆",
    category: "quiz",
    isUnlocked: true,
  },
];

export default function TreasureBadgeModal({
  isOpen,
  onClose,
  unlockedBadgeIds = ["badge-sun", "badge-drum", "badge-mars"],
}: TreasureBadgeModalProps) {
  if (!isOpen) return null;

  const totalUnlocked = ALL_BADGES.filter((b) => unlockedBadgeIds.includes(b.id)).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-xl bg-slate-900 border border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl text-white max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-800">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-500 flex items-center justify-center text-stone-950 font-bold shadow-lg shadow-amber-500/30 text-xl">
            🎖️
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <Sparkles size={12} /> Bộ Sưu Tập Huy Hiệu Khám Phá
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
              Hành Trình Sưu Tầm ({totalUnlocked}/{ALL_BADGES.length} Đã Mở Khóa)
            </h2>
          </div>
        </div>

        {/* Badge Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ALL_BADGES.map((badge) => {
            const isUnlocked = unlockedBadgeIds.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                  isUnlocked
                    ? "bg-slate-950/80 border-amber-500/40 shadow-lg shadow-amber-500/5"
                    : "bg-slate-950/40 border-slate-800 opacity-50 grayscale"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 border ${
                    isUnlocked
                      ? "bg-amber-500/20 border-amber-400/50 shadow-inner"
                      : "bg-slate-900 border-slate-800"
                  }`}
                >
                  {badge.icon}
                </div>

                <div className="overflow-hidden flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-white truncate">{badge.name}</h3>
                    {isUnlocked ? (
                      <CheckCircle size={13} className="text-emerald-400 shrink-0" />
                    ) : (
                      <Lock size={13} className="text-slate-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-snug">
                    {badge.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 text-center">
          <p className="text-xs text-slate-400 mb-3">
            💡 <em>Mẹo: Hãy bấm vào tất cả các điểm sáng 360° và làm bài trắc nghiệm để mở khóa 100% huy hiệu!</em>
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition border border-slate-700"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
