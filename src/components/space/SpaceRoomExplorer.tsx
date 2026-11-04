"use client";

import React, { useState } from "react";
import { SpaceRoom, SpaceTopic } from "@/data/space-exhibition";
import { getYouTubeThumbnailUrl, extractYouTubeVideoId } from "@/lib/youtube-utils";
import TopicDetailModal from "@/components/space/TopicDetailModal";
import {
  Rocket,
  Sparkles,
  HelpCircle,
  Video,
  Play,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Eye,
  BookOpen,
  Orbit,
  Moon,
  Layers,
  Compass,
} from "lucide-react";

interface SpaceRoomExplorerProps {
  rooms: SpaceRoom[];
  onOpenSolar3D?: () => void;
  onOpenEarthMoonLab?: () => void;
}

export default function SpaceRoomExplorer({
  rooms,
  onOpenSolar3D,
  onOpenEarthMoonLab,
}: SpaceRoomExplorerProps) {
  const [activeRoomId, setActiveRoomId] = useState<string>(
    rooms[0]?.id || "room-1"
  );
  const [selectedTopic, setSelectedTopic] = useState<SpaceTopic | null>(null);

  const activeRoom =
    rooms.find((r) => r.id === activeRoomId) || rooms[0] || null;

  if (!activeRoom) {
    return (
      <div className="p-8 text-center text-slate-400">
        Không có dữ liệu phòng khám phá nào.
      </div>
    );
  }

  // Handle previous/next topic inside modal
  const currentTopicIndex = activeRoom.topics.findIndex(
    (t) => t.id === selectedTopic?.id
  );
  const handlePrevTopic =
    currentTopicIndex > 0
      ? () => setSelectedTopic(activeRoom.topics[currentTopicIndex - 1])
      : undefined;
  const handleNextTopic =
    currentTopicIndex >= 0 && currentTopicIndex < activeRoom.topics.length - 1
      ? () => setSelectedTopic(activeRoom.topics[currentTopicIndex + 1])
      : undefined;

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* 3 Main Room Tabs Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/80 p-2 sm:p-2.5 rounded-3xl border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 flex-1">
          {rooms.map((room, idx) => {
            const isActive = room.id === activeRoomId;
            let icon = "🚀";
            if (idx === 1) icon = "🕳️";
            if (idx === 2) icon = "✨";

            return (
              <button
                key={room.id}
                onClick={() => setActiveRoomId(room.id)}
                className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-2.5 sm:px-4 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-300 relative overflow-hidden ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 scale-[1.02]"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
                title={room.title}
              >
                <span className="text-base sm:text-lg shrink-0">{icon}</span>
                <span className="truncate font-bold">{room.title}</span>
              </button>
            );
          })}
        </div>

        {/* 3D Lab Quick Action Buttons */}
        <div className="flex items-center justify-end gap-1.5 shrink-0 px-1">
          {onOpenSolar3D && (
            <button
              onClick={onOpenSolar3D}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-semibold shadow transition"
              title="Mở mô phỏng 3D Hệ Mặt Trời tương tác"
            >
              <Orbit size={15} />
              <span className="hidden md:inline">Mô Hình 3D Hệ Mặt Trời</span>
            </button>
          )}

          {onOpenEarthMoonLab && (
            <button
              onClick={onOpenEarthMoonLab}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-semibold shadow transition"
              title="Phòng thí nghiệm Trái Đất - Mặt Trăng"
            >
              <Moon size={15} />
              <span className="hidden md:inline">Lab Trái Đất - Mặt Trăng</span>
            </button>
          )}
        </div>
      </div>

      {/* Room Showcase Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-5 sm:p-8 shadow-2xl">
        <div
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: activeRoom.themeColor || "#0ea5e9" }}
        />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-cyan-300 text-xs font-semibold">
            <Sparkles size={13} className="text-cyan-400" />
            <span>{activeRoom.badge}</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">{activeRoom.topics.length} Chủ Đề Khám Phá</span>
          </div>

          <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
            {activeRoom.title}
          </h2>

          <p className="text-xs sm:text-base text-slate-300 leading-relaxed font-normal">
            {activeRoom.description}
          </p>
        </div>
      </div>

      {/* Topic Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-5">
        {activeRoom.topics.map((topic, index) => {
          const hasVideo = !!extractYouTubeVideoId(topic.youtubeUrl);
          const ytThumb = getYouTubeThumbnailUrl(topic.youtubeUrl);
          const displayImage = topic.coverImage || ytThumb;

          return (
            <div
              key={topic.id}
              onClick={() => setSelectedTopic(topic)}
              className="group cursor-pointer rounded-3xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition-all duration-300 shadow-lg hover:shadow-cyan-500/10 flex flex-col overflow-hidden relative"
            >
              {/* Card Image Banner */}
              <div className="relative aspect-[16/9] sm:aspect-[2/1] w-full bg-slate-950 overflow-hidden">
                {displayImage ? (
                  <img
                    src={displayImage}
                    alt={topic.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-950 text-slate-700">
                    <Sparkles size={36} />
                  </div>
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/30" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md text-cyan-300 border border-cyan-400/30 flex items-center gap-1.5 shadow">
                    <span>{topic.emoji}</span>
                    <span>{topic.badge}</span>
                  </span>

                  {hasVideo && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-red-600/90 text-white flex items-center gap-1 shadow">
                      <Play size={10} fill="currentColor" />
                      <span>YouTube</span>
                    </span>
                  )}
                </div>

                {/* Center play icon for videos */}
                {hasVideo && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                      <Play size={22} fill="currentColor" className="ml-1" />
                    </div>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
                <div>
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
                    <span>#{index + 1}</span>
                    <span>•</span>
                    <span className="truncate">{topic.subtitle}</span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {topic.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                    {topic.summary}
                  </p>
                </div>

                {/* Key Fact Highlight */}
                {topic.keyFacts && topic.keyFacts[0] && (
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-2 text-xs">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <span>{topic.keyFacts[0].icon || "💡"}</span>
                      <span className="font-medium truncate">
                        {topic.keyFacts[0].label}:
                      </span>
                    </span>
                    <span className="font-bold text-cyan-300 truncate">
                      {topic.keyFacts[0].value}
                    </span>
                  </div>
                )}

                {/* Footer Action */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-cyan-400">
                  <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Mở bài học chi tiết</span>
                    <ArrowRight size={14} />
                  </span>

                  {topic.quizQuestions && topic.quizQuestions.length > 0 && (
                    <span className="text-[11px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                      Có đố vui 🎯
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Topic Deep Dive Modal */}
      {selectedTopic && (
        <TopicDetailModal
          topic={selectedTopic}
          onClose={() => setSelectedTopic(null)}
          onPrev={handlePrevTopic}
          onNext={handleNextTopic}
        />
      )}
    </div>
  );
}
